const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');

const app = express();

// enable file upload
app.use(fileUpload({
    createParentPath: true
}));

const Blog = require('./models/blog');

// route imports
const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');
const profileRoutes = require('./routes/profileRoutes');

const { requireAuth, checkUser } = require('./middleware/authMiddleware');

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

// rendering the homepage
app.get('/', (req, res) => {
    Blog.find().sort({ createdAt: -1 })
    .then((result) => {
        res.render('index', {title: 'All Blogs', blogs: result})
    })
    .catch((err) => {
        console.log(err);
    })
});

// profile routes
app.use('/profile', requireAuth, profileRoutes);

// blog routes
app.use('/blogs', requireAuth, blogRoutes);

// auth routes
app.use(authRoutes);

// 404 page
app.use((req, res) => {
    res.status(404).render('404', {title: '404'});
});
