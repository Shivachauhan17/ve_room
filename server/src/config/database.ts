// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
import * as mysql from 'mysql2';
let con: mysql.Connection | null = null;


const connectDB = () => {
  if (!con) {
      con = mysql.createConnection({
          host: "localhost",
          user: "root",
          password: "Shiva@1974",
          port: 3307,
          database: 'watchparty'
      });

      con.connect((err) => {
          if (err) {
              console.error('Error connecting to database:', err);
              return;
          }
          console.log('Connected to database');
      });
  }
  
  return con;
};

export default connectDB();