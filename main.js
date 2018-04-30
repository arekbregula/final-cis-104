'use strict';

const prompt = require('readline-sync');
const fs = require('fs');

const MAX_EMPLOYEE_ID = 100000;
const EMPLOYEE_FILE = './data/employees.csv';
const MAIN_MENU = [
	{text: '1. View current employees', action: outputEmployeeDetails},
	{text: '2. Modify an employee', action: editEmployee},
	{text: '3. Add a new employee', action: addEmployee},
	{text: '4. Remove an employee', action: removeEmployee},
	{text: '5. Exit', action: exit}
];

let employees = [];
let wantsToExit = false;

/**
 * The main dispatcher function for the program.
 */
function main() {
	setEmployees();
	while(wantsToExit == false) {
		showMainMenu();
		writeEmployees();
	}
	writeEmployees();
}

/**
 * Reads a csv file and outputs an array.
 * @param  {String} filepath Path of the csv file
 * @return {Array}          A two dimensional array which represents the contents of the csv file
 */
function readCsv(filepath) {
	let fileContents = fs.readFileSync(filepath, 'utf-8');
	let csvRows = fileContents.split(/\r?\n/);
	let returnData = [];
	for(let i = 0; i < csvRows.length; i++) {
		if(csvRows[i].trim() === '') { continue; }
		let rowData = csvRows[i].trim().split(',');

		let row = [];
		for(let x = 0; x < rowData.length; x++) {
			row.push(rowData[x]);
		}
		returnData.push(row);
	}

	return returnData;
}

/**
 * Writes a two dimensional array to a csv file located at filepath.
 * @param  {String} filepath Path for the csv file to be written.
 * @param  {Array}  data     Two dimensional array which is to be written as a csv file.
 */
function writeCsv(filepath, data) {
	let colCount = data[0].length;
	let csvString = '';

	for(let i = 0; i < data.length; i++) {
		for(let x = 0; x < colCount; x++) {
			csvString += `${data[i][x]}`;
			if(x < colCount-1) {
				csvString += ',';
			}
		}
		csvString += '\n';
	}
	fs.writeFileSync(filepath, csvString);
}

/**
 * Reads the employees from a csv file and sets the employees variable.
 */
function setEmployees() {
	let csvData = readCsv(EMPLOYEE_FILE);
	for(var i = 0; i < csvData.length; i++) {
		employees.push({
			id: csvData[i][0],
			firstName: csvData[i][1],
			lastName: csvData[i][2],
			email: csvData[i][3],
			hourlyWage: Number(csvData[i][4])
		});
	}
}

/**
 * Writes the employees variable into the csv file.
 */
function writeEmployees() {
	let csvData = [];
	for(let i = 0; i < employees.length; i++) {
		let employee = employees[i];
		let row = [
			employee.id,
			employee.firstName,
			employee.lastName,
			employee.email,
			String(employee.hourlyWage)
		];
		csvData.push(row);
	}
	writeCsv(EMPLOYEE_FILE, csvData);
}

/**
 * Shows the main menu and performs the action selected by the user.
 */
function showMainMenu() {
	console.log('---------------------------------------');
	for(let i = 0; i < MAIN_MENU.length; i++) {
		console.log(`${MAIN_MENU[i].text}`);
	}

	let selectedAction = prompt.questionInt(">>> ");
	if(selectedAction > MAIN_MENU.length || selectedAction <= 0) {
		console.log("\nInput not valid. Please try again.");
		showMainMenu();
	} else {
		MAIN_MENU[selectedAction-1].action();
	}
}

/**
 * Shows a list of all employees along with each one's details.
 */
function outputEmployeeDetails() {
	for(let i = 0; i < employees.length; i++) {
		let employee = employees[i];
		console.log('\n--------------------------------');
		console.log(`ID: ${employee.id}`);
		console.log(`Name: ${employee.firstName} ${employee.lastName}`);
		console.log(`Email: ${employee.email}`);
		console.log(`Hourly Wage: $${employee.hourlyWage.toFixed(2)}`);
	}
}

/**
 * Asks for an employee id and allows the editing of that employee.
 */
function editEmployee() {
	outputEmployeeDetails();
	let selectedEmployee = prompt.questionInt('Employee ID: ');
	let employee = employees.find(emp => Number(emp.id) == selectedEmployee);

	if(employee != undefined) {
		console.log('------------------------------------');
		console.log('Press enter to keep current value. Any new input will be changed in the employees file.');
		var firstName = prompt.question(`First Name (${employee.firstName}): `, { defaultInput: employee.firstName});
		var lastName = prompt.question(`Last Name (${employee.lastName}):`, { defaultInput: employee.lastName});
		var email = prompt.questionEMail(`Email (${employee.email}): `, { defaultInput: employee.email});
		var hourlyWage = prompt.questionInt(`Hourly Wage (${employee.hourlyWage}): `, { defaultInput: employee.hourlyWage});

		employee.firstName = firstName;
		employee.lastName = lastName;
		employee.email = email;
		employee.hourlyWage = hourlyWage;

		employees[employees.indexOf(employee)] = employee;
		outputEmployeeDetails();
	} else {
		console.log('Employee ID not valid. Please try again.');
		editEmployee();
	}

}

/**
 * Finds an available ID for a new employee.
 * @return {Number} Employee ID
 */
function findNewEmployeeId() {
	let id = 1;
	for(let i = 0; i < MAX_EMPLOYEE_ID; i++) {
		if(employees.find(emp => Number(emp.id) == id) == undefined)  {
			return id;
		}
		id++;
	}
}

/**
 * Asks for the first name, last name, email and hourly wage for a new employee, saving the data to the employees variable.
 */
function addEmployee() {
	let id = findNewEmployeeId();
	let firstName = prompt.question("First Name: ");
	let lastName = prompt.question("Last Name: ");
	let email = prompt.questionEMail("Email: ");
	let hourlyWage = prompt.questionInt("Hourly Wage: ");

	employees.push({
		id,
		firstName,
		lastName,
		email,
		hourlyWage
	});

	console.log('\nNew employee has been added!');
}

/**
 * Asks for an employee id and then removes that employee from the employees variable.
 */
function removeEmployee() {
	console.log('--------------------------------------------');
	outputEmployeeDetails();
	let selectedEmployee = prompt.questionInt('\nEmployee ID: ');

	let employee = employees.find(emp => Number(emp.id) == selectedEmployee);
	if(employee == undefined) {
		console.log('Employee ID invalid. Please try again.');
		removeEmployee();
	} else {
		employees.splice(employees.indexOf(employee), 1);
	}
}

/**
 * Sets the wantsToExit variable to true, causing the program to exit.
 * @return {[type]} [description]
 */
function exit() {
	wantsToExit = true;
}

main();