//Define the include function for absolute file name.
// Taken from COMP 2537 provided sample code.
// Author: Kelly Hagg
// Last modified: 2023-05-26
global.base_dir = __dirname;
global.abs_path = function (path) {
	return base_dir + path;
}
global.include = function (file) {
	return require(abs_path('/' + file));
}
