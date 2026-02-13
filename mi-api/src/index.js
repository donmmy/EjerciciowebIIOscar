import app from "./app.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`ENTORNO: ${process.env.NODE_ENV || 'DEVELOPMENT'}`);
    console.log(`SERVER: http://localhost:${PORT}`);
});