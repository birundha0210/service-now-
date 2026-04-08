// ===============================
// 🔷 SERVICE NOW TRANSFORM SCRIPT
// ===============================

// 🔹 Current Time
var currentTime = new GlideDateTime();

// 🔹 Validate Salary (if field exists)
if (source.salary && parseFloat(source.salary) < 0) {
    gs.warn("Invalid salary for: " + source.name);
    ignore = true; // skip record
}

// 🔹 Clean Email (lowercase)
if (source.email) {
    source.email = source.email.toLowerCase();
}

// ===============================
// 🔹 DEPARTMENT HANDLING
// ===============================
var deptGR = new GlideRecord('department');
deptGR.addQuery('name', source.department);
deptGR.query();

var deptSysId;

if (deptGR.next()) {
    deptSysId = deptGR.sys_id;
} else {
    deptGR.initialize();
    deptGR.name = source.department;
    deptSysId = deptGR.insert();
    gs.info("New Department Created: " + source.department);
}

// ===============================
// 🔹 MANAGER HANDLING (SELF REF)
// ===============================
var mgrGR = new GlideRecord('employee');
mgrGR.addQuery('name', source.manager);
mgrGR.query();

var mgrSysId;

if (mgrGR.next()) {
    mgrSysId = mgrGR.sys_id;
} else {
    mgrGR.initialize();
    mgrGR.name = source.manager;
    mgrSysId = mgrGR.insert();
    gs.info("New Manager Created: " + source.manager);
}

// ===============================
// 🔹 CHECK EXISTING EMPLOYEE
// ===============================
var empGR = new GlideRecord('employee');
empGR.addQuery('email', source.email);
empGR.query();

if (empGR.next()) {
    // 🔁 UPDATE EXISTING RECORD
    empGR.name = source.name;
    empGR.phone = source.phone;
    empGR.department = deptSysId;
    empGR.manager = mgrSysId;
    empGR.u_last_updated = currentTime;
    empGR.update();

    gs.info("Updated Employee: " + source.name);
    ignore = true; // prevent duplicate insert
}

// ===============================
// 🔹 INSERT NEW RECORD
// ===============================
target.name = source.name;
target.email = source.email;
target.phone = source.phone;
target.department = deptSysId;
target.manager = mgrSysId;
target.u_created_time = currentTime;

// ===============================
// 🔹 FINAL LOG
// ===============================
gs.info("Processed Employee: " + source.name);
