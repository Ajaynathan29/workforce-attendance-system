 const db = require('../config/db');

// @desc    Create new employee
// @route   POST /api/employees
const createEmployee = async (req, res) => {
  try {
    const { employee_code, full_name, email, mobile_number, department, designation, status } = req.body;

    if (!employee_code || !full_name || !email || !mobile_number || !department || !designation) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const query = `
      INSERT INTO employees (employee_code, full_name, email, mobile_number, department, designation, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
      employee_code, full_name, email, mobile_number, department, designation, status || 'Active'
    ]);

    res.status(201).json({
      message: 'Employee created successfully',
      employee_id: result.insertId
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Employee code or email already exists' });
    }
    console.error('Error creating employee:', error);
    res.status(500).json({ message: 'Server error while creating employee' });
  }
};

// @desc    Get all employees (with Search, Filter & Pagination)
// @route   GET /api/employees
const getEmployees = async (req, res) => {
  try {
    const { search, department, status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let whereClauses = [];
    let queryParams = [];

    // Search by Name, Email, or Code
    if (search) {
      whereClauses.push(`(full_name LIKE ? OR email LIKE ? OR employee_code LIKE ?)`);
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    // Filter by Department
    if (department) {
      whereClauses.push(`department = ?`);
      queryParams.push(department);
    }

    // Filter by Status
    if (status) {
      whereClauses.push(`status = ?`);
      queryParams.push(status);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Get total count for pagination metadata
    const [countResult] = await db.execute(`SELECT COUNT(*) as total FROM employees ${whereSql}`, queryParams);
    const totalEmployees = countResult[0].total;

    // Fetch paginated data (MySQL limit/offset requires integers)
    const dataQuery = `
      SELECT * FROM employees 
      ${whereSql} 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    queryParams.push(parseInt(limit), parseInt(offset));

    const [employees] = await db.execute(dataQuery, queryParams);

    res.status(200).json({
      data: employees,
      pagination: {
        total: totalEmployees,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalEmployees / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Server error while fetching employees' });
  }
};

// @desc    Get single employee by ID
// @route   GET /api/employees/:id
const getEmployeeById = async (req, res) => {
  try {
    const [employees] = await db.execute('SELECT * FROM employees WHERE employee_id = ?', [req.params.id]);

    if (employees.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.status(200).json(employees[0]);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ message: 'Server error while fetching employee' });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
const updateEmployee = async (req, res) => {
  try {
    const { employee_code, full_name, email, mobile_number, department, designation, status } = req.body;
    const employeeId = req.params.id;

    const [existing] = await db.execute('SELECT * FROM employees WHERE employee_id = ?', [employeeId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const query = `
      UPDATE employees 
      SET employee_code = ?, full_name = ?, email = ?, mobile_number = ?, department = ?, designation = ?, status = ?
      WHERE employee_id = ?
    `;

    await db.execute(query, [
      employee_code, full_name, email, mobile_number, department, designation, status, employeeId
    ]);

    res.status(200).json({ message: 'Employee updated successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Employee code or email already exists' });
    }
    console.error('Error updating employee:', error);
    res.status(500).json({ message: 'Server error while updating employee' });
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
const deleteEmployee = async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM employees WHERE employee_id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'Server error while deleting employee' });
  }
};

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
};