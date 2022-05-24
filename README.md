# RSA-API
The Repair-Services-Application-API that will be the back-end of the application. The purpose of this repository is provide the api-endpoints functionalitites and data transportation between the databse and the web application's front-end

## Used tools
The following tools are used to accomplish the goal of this project:
- Code and Version control (Git / Github desktop).
- JavaScript runtime environment (Node.js).
- Project and package management (npm). 
- Automatic server restart if any changes occurs on the project files (nodemon).
- Code editor (Visual Studio Code).
- Static analysis (ESLint).
- HTTP APIs desigining tool (Insomnia).

## Frameworks
The following frameworks are used for this project development:

- body-parser
- cookie-parser
- cors
- cross-env
- dotenv-safe
- express
- express-validator
- jsonwebtoken
- pbkdf2
- pg
- phone
- swedish-personal-identity-number-validator
- validator
- winston

## Project installation

- First, get/install the latest long time supported (LTS) version of Node.js from their [website](https://nodejs.org/). The used version for this project is (Node.js v16.15.0).
- Second, close this repository.
- Third, make sure you install all the required dependencies using npm. The dependencies installation can be done using the command `npm install` in the installed path folder.

## Starting the application
Since the porject contains API endpoints, some tool can be used  for the api-endpoints calling process. Used tools for this project are [Insomnia](https://insomnia.rest/) and [Postman](https://www.postman.com/).

1. Make a copy of the file named .env.example and the copy name it ".env".
2. Modify the ".env" by filling the required fields with correct data.
3. Make sure you have created the database and that it is running in the background (it will be used by this project).
4. To start the application, in the command prompt (for Windows users), go to the path where this project has been installed, and run the command `npm run start` to start the project in the production mode, or can use `npm run start-dev` if you need to start it in development mode.
5. Wait until you can see that the project has been started.
6. Start Insomnia/Postman
7. Import the file "Insomnia_API_endpoints.json" which includes the api-endpoints needed/supported by this project, and run them.

## Project cloud deployment
For this project, Heroku platform has been chosen for the deployment, but other platforms can be chosen as well, that means these steps may not be fully correct:
1. Create a Heroku account for freee [here](https://signup.heroku.com/)
2. Install the latest version of this project `RSA-API` on your machine.
3. Install the Heroku CLI from [here](https://devcenter.heroku.com/articles/heroku-cli)
4. Login to your Heroku account using the command `heroku login`.
5. A new browser window will open to login to your account.
6. Go to the installed project path (`RSA-API` instance that has been downloaded earlier in step 2).
7. Create a Git init folder (Initialization) using `git init`.
8. Create a "Procfile" file and write in it `web: node src/server.js` and save the changes.
9. Delete the .gitignore file or modify it, so it let uploading the .env file
10. The file ".env" should be field with required data (VERY IMPORTANT TO FILL IT WITH THE CORRECT DATA).
11. Configure the git configuration using the commands: `git config user.email "email"`,  `git config user.name "name"` where email and name are the heroku account owner's name and email.
12. Add the git files to the Git repository using `git add .`
13. Commit the changes to the Github repository using `git commit -m "Initial commit."`
14. Create a new Heroku project by running the command `heroku create` in the shell terminal.
15. Push the Git repoistory to the project instance using the command `git push heroku master`.
16. To check if the push has successeded, run the command `heroku logs -n 200` which will include data about the project's status and logs.

## Code documentation
All the code different public functions and classes are well documented for easier code understanding and future development.
