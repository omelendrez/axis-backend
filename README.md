# axis-backend

This node app is the Axis API and integrates our database with the UI.

---

## 🔵 Tolmann - Axis 2.0 Backend setup

You should have MySQL Server 8.0 Community version installed in the server.

If MySQL is not installed you should install it from https://dev.mysql.com/downloads/windows/installer/8.0.html

You should have Nodejs version 16 or higher installed in the server.

If Nodejs is not installed you should install version 18.15.0 from https://nodejs.org/en

---

## 🔵 Clonning and installing the app

Install **Git** from https://git-scm.com/ by clicking on the Download for Windows button inside the image with a computer monitor and current stable version number. You will need git to perform several activities, mainly by using **Git Bash**.

Once installe, run **Git Bash** in order to open the _bash terminal_. (To find Git Bash app just click on Start icon in Windows machine and type **git bash**.)

Here is where you are going to perform the app setup and run it.

You will need to have a folder called **webserver** in drive **C:**.

**Tip:** _Always press Enter after each command you are requested to type._

In order to do that, change to drive **C:** by typing:

```bash
cd /c/
```

After that, just type

```bash
mkdir webserver
```

This command will create (if not exists) the folder **webserver** in **C:** drive

If the folder already exists you should get the following error message:

```bash
mkdir: cannot create directoary 'webserver':: File exists
```

Don't worry if you got the message. This is expected and nothing wrong will happen to the process.

You have now to move inside that directory by doing:

```bash
cd webserver
```

Now you have to clone the GitHub repository by runing the following command:

```bash
git clone https://github.com/omelendrez/axis-backend.git
```

Now you have to move inside the new folder created by the clone action as follows:

```bash
cd axis-backend
```

You should run now:

```bash
npm ci
```

This command line will install all the app dependencies.

You will find a file called `.env.example` in that folder.

You have to copy that file in the same folder with a different name. Just name it `.env`

Now you have to edit that `.env` file and check the content.

```bash
MYSQL_HOST="localhost"
MYSQL_USER="axis_user"
MYSQL_PASSWORD="M1a4$1t4E8r0"
MYSQL_DB="axis"
MYSQL_PORT="3306"
PORT="3000"
JWT_SECRET="2ipCumb37hPNRUJt8Ze5GroFGaH0LslP"
```

Now you need to set the actual user, password and database values.

The values correspond to the **axis** MySQL database we want to create with the data coming from SQL Server Axis.

Once the file has been created and the right credentials have been updated in this file, you can run the data conversion by typing:

```bash
npm start
```

The app will show in the terminal when the server is ready.
If everything concludes without errors, you should see the last message as follows:

![Screenshot 2023-04-18 084321](https://user-images.githubusercontent.com/7883563/232766843-60cb917d-1687-4b7b-8269-c5921740be8d.png)

If this is the case, the new version of axis database has already running in the MySQL server.

## Node version

We use `v20.9.0` and we will not upgrade yet due to a warning caused by the issue below which shows up starting with `v21.0.0`.

https://github.com/forcedotcom/cli/issues/2535
