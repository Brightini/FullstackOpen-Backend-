const express = require("express");
const app = express();
const morgan = require("morgan");

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const numberOfPersons = persons.length;

const generateID = () => {
  const maxID =
    persons.length > 0 ? Math.max(...persons.map((n) => Number(n.id))) : 0;
  return String(maxID + 1);
};

const checkDuplicateNames = (name) => {
  return persons.find((person) => person.name === name);
};

morgan.token("body", function (req, res) {
  return JSON.stringify(req.body);
});

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

app.use(express.json());

app.post("/api/persons", (request, response) => {
  const body = request.body;
  const status = checkDuplicateNames(body.name);

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "missing content (name/number)",
    });
  } else if (status) {
    return response.status(400).json({
      error: "name must be unique",
    });
  }

  const person = {
    id: generateID(),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(person);
  response.json(person);
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const personInfo = persons.find((person) => person.id === id);
  if (personInfo) response.json(personInfo);
  else response.status(404).end();
});

app.get("/info", (request, response) => {
  const dateTime = new Date();
  response.send(`
    <p>Phonebook has info for ${numberOfPersons} people</p>
    ${dateTime}
    `);
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  persons = persons.filter((person) => person.id !== id);
  response.status(204).end();
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({
    error: "unknown endpoint",
  });
};
app.use(unknownEndpoint);

const PORT = 3002;
app.listen(PORT);
console.log(`Listening on port ${PORT}`);
