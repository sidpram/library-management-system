# library-management-system
#### Developer : SID
This is a labrary managemnt system.

M: MongoDB (Database)

E: ExpressJS (Backend)

R: React + Tailwind CSS (Front End )

N: NodeJS (backend/Server)

Goal is  it use the MERN concept in the Application. 

Frontend which client side browser will communicate with backend code and backend server is responsible to connect with Data base. Forntend will not communicate with DB directly.



### Command
npm init
npm i express

//dev
npm i nodemon --save-dev

npm run dev

npm i mongoose

npm install mongodb

npm i dotenv

### Commit the code
git status

git add .

git status

git commit -a "Initial Commit for testing"

git push

### Creating backup branch
git status 

git switch -c Full-Dash-board

git push -u origin Full-Dash-board 

#### Switching back to main
git switch main


### MVC Architecture
>>M: Model  (Structure of our MongoDb)

>>V: View   (Frontend)

>>C: Controller (Logic, or brain of App)


### Example: create book (wrapped payload)
If your client sends the book object wrapped inside a `data` property, the API accepts it. Example using `curl`:

```bash
curl -X POST http://localhost:8081/books \
	-H "Content-Type: application/json" \
	-d '{"data": {"name": "The Hobbit","author":"J.R.R. Tolkien","genre":"Fantasy","price":"12.99","publisher":"Houghton Mifflin"}}'
```

Or send the object directly (preferred):

```bash
curl -X POST http://localhost:8081/books \
	-H "Content-Type: application/json" \
	-d '{"title":"The Hobbit","author":"J.R.R. Tolkien","genre":"Fantasy","price":"12.99","publisher":"Houghton Mifflin"}'
```

### Frontend (React + Tailwind) — Dashboard
I scaffolded a `client` React app using Vite and Tailwind to manage books and users.

How to run the frontend (from project root):

```bash
cd client
npm install
npm run dev
```

The client expects the backend at `http://localhost:8081` (default from this repo). The dashboard includes pages for Books and Users with create/list actions.