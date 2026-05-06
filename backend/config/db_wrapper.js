const { Pool } = require('pg');

class MySQLToPGWrapper {
  constructor(config) {
    // If a connection string is provided (e.g. Supabase), use it
    if (config.connectionString) {
        this.pool = new Pool({
            connectionString: config.connectionString,
            ssl: { rejectUnauthorized: false }
        });
    } else {
        this.pool = new Pool({
            host: config.host,
            user: config.user,
            password: config.password,
            database: config.database,
            port: config.port || 5432,
            ssl: { rejectUnauthorized: false }
        });
    }
  }

  // Convert ? to $1, $2, etc.
  convertQuery(sql) {
    let i = 1;
    let pgSql = sql.replace(/\?/g, () => '$' + (i++));
    // Also remove backticks used for MySQL identifiers
    pgSql = pgSql.replace(/`/g, '');
    return pgSql;
  }

  async execute(sql, params = []) {
    return this.query(sql, params);
  }

  async query(sql, params = []) {
    let pgSql = this.convertQuery(sql);
    const isInsert = pgSql.trim().toUpperCase().startsWith('INSERT');
    
    // Automatically append RETURNING id for inserts so insertId works
    if (isInsert && !pgSql.toUpperCase().includes('RETURNING')) {
        pgSql += ' RETURNING id';
    }

    try {
        const res = await this.pool.query(pgSql, params);
        
        const isSelect = pgSql.trim().toUpperCase().startsWith('SELECT');
        const rows = res.rows;

        // Mimic mysql2 returned structure [result, fields]
        if (!isSelect) {
            const resultObj = {
                affectedRows: res.rowCount,
                insertId: (isInsert && rows.length > 0) ? rows[0].id : null
            };
            return [resultObj, res.fields];
        }

        return [rows, res.fields];
    } catch (err) {
        console.error("PG Wrapper Error on query:", pgSql, params);
        throw err;
    }
  }

  async getConnection() {
    const client = await this.pool.connect();
    const self = this;
    
    return {
      query: async (sql, params = []) => {
          let pgSql = self.convertQuery(sql);
          const isInsert = pgSql.trim().toUpperCase().startsWith('INSERT');
          
          if (isInsert && !pgSql.toUpperCase().includes('RETURNING')) {
              pgSql += ' RETURNING id';
          }

          try {
              const res = await client.query(pgSql, params);
              const isSelect = pgSql.trim().toUpperCase().startsWith('SELECT');
              
              if (!isSelect) {
                 return [{ 
                     affectedRows: res.rowCount, 
                     insertId: (isInsert && res.rows.length > 0) ? res.rows[0].id : null 
                 }];
              }
              return [res.rows];
          } catch (err) {
              console.error("PG Wrapper Error on connection query:", pgSql, params);
              throw err;
          }
      },
      execute: async function(sql, params) { return this.query(sql, params); },
      release: () => client.release(),
      end: () => client.release()
    };
  }

  async end() {
    return this.pool.end();
  }
}

module.exports = MySQLToPGWrapper;
