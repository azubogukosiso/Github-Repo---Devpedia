const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');


const app = express();

// enable files upload
app.use(fileUpload({
    createParentPath: true
}));

const Blog = require('./models/blog');

const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');

const { requireAuth, checkUser } = require('./middleware/authMiddleware');

// const dbURI = 'mongodb+srv://azubogu:kosi2003@nodetuts.acjp84w.mongodb.net/tech-blog';
// mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then((result) => app.listen(3000, console.log('listening...')))
//     .catch((err) => console.log(err))

// app.listen(3000, console.log('listening...'));

// connection to the dbase
mongoose.connect('mongodb://localhost:27017/tech-blog',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
    console.log("connection successful ✅");
    app.listen(3000, () => {
        console.log("server is running at port 3000");
    });
});

// set view engine
app.set('view engine', 'ejs');

// middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// routes
app.get('*', checkUser); // on every get request made run the 'checkUser' function is run

app.get('/', (req, res) => {
    // const blogs = [
    //     {title: 'This is heading one', snippet: 'This is subheading one'},
    //     {title: 'This is heading two', snippet: 'This is subheading two'},
    //     {title: 'This is heading three', snippet: 'This is subheading three'},
    // ];
    // res.render('index', {title: 'Blogs', blogs})

    Blog.find().sort({ createdAt: -1 })
    .then((result) => {
        res.render('index', {title: 'All Blogs', blogs: result})
    })
    .catch((err) => {
        console.log(err);
    })
});

app.get('/login', (req, res) => {
    res.render('login', {title: 'Log In'})
});

app.get('/signup', (req, res) => {
    res.render('signup', {title: 'Sign Up'})
});

app.get('/profile', requireAuth, (req, res) => {
    res.render('profile', {title: 'Your Profile'})
});

// blog routes
app.use('/blogs', requireAuth, blogRoutes);

// auth routes
app.use(authRoutes);

// 404 page
app.use((req, res) => {
    res.status(404).render('404', {title: '404'});
});
