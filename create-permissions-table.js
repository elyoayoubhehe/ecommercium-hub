const mysql = require('mysql2/promise');
require('dotenv').config();

async function createPermissionsTable() {
  try {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'ayoubelyo05',
      database: process.env.DB_DATABASE || 'ecommercium_hub'
    });
    
    console.log('Connected to MySQL database');
    
    // Create user_permissions table if it doesn't exist
    console.log('Creating user_permissions table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        manage_orders BOOLEAN DEFAULT FALSE,
        manage_products BOOLEAN DEFAULT FALSE,
        manage_categories BOOLEAN DEFAULT FALSE,
        manage_users BOOLEAN DEFAULT FALSE,
        manage_admins BOOLEAN DEFAULT FALSE,
        view_analytics BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Add default permissions for existing admin users who don't have permissions yet
    console.log('Setting up default permissions for admin users...');
    const [adminUsers] = await connection.query('SELECT id FROM users WHERE role = "admin"');
    
    for (const admin of adminUsers) {
      // Check if permissions already exist
      const [existingPermissions] = await connection.query(
        'SELECT id FROM user_permissions WHERE user_id = ?', 
        [admin.id]
      );
      
      if (existingPermissions.length === 0) {
        // Insert default permissions (full access) for admin
        await connection.query(
          `INSERT INTO user_permissions 
           (user_id, manage_orders, manage_products, manage_categories, manage_users, manage_admins, view_analytics) 
           VALUES (?, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE)`,
          [admin.id]
        );
        console.log(`Added default permissions for admin user ID ${admin.id}`);
      } else {
        console.log(`Admin user ID ${admin.id} already has permissions`);
      }
    }
    
    // Display the permissions table structure
    const [columns] = await connection.query('SHOW COLUMNS FROM user_permissions');
    console.log('\nUser permissions table structure:');
    columns.forEach(column => {
      console.log(`- ${column.Field}: ${column.Type}${column.Null === 'NO' ? ' (NOT NULL)' : ''} ${column.Default ? `DEFAULT: ${column.Default}` : ''}`);
    });
    
    // Display existing permissions
    const [permissions] = await connection.query(`
      SELECT p.*, u.email, u.first_name, u.last_name 
      FROM user_permissions p
      JOIN users u ON p.user_id = u.id
    `);
    
    console.log('\nCurrent permissions:');
    permissions.forEach(perm => {
      console.log(`- User: ${perm.first_name} ${perm.last_name} (${perm.email})`);
      console.log(`  • Orders: ${perm.manage_orders ? 'Yes' : 'No'}`);
      console.log(`  • Products: ${perm.manage_products ? 'Yes' : 'No'}`);
      console.log(`  • Categories: ${perm.manage_categories ? 'Yes' : 'No'}`);
      console.log(`  • Users: ${perm.manage_users ? 'Yes' : 'No'}`);
      console.log(`  • Admins: ${perm.manage_admins ? 'Yes' : 'No'}`);
      console.log(`  • Analytics: ${perm.view_analytics ? 'Yes' : 'No'}`);
    });
    
    await connection.end();
    console.log('\nPermissions table setup complete');
  } catch (err) {
    console.error('Database error:', err);
  }
}

createPermissionsTable().then(() => console.log('Script finished')); 