const dummy = () => {
  return 1;
};

const totalLikes = (blogs) => {
  let likes = 0;
  blogs.forEach((blog) => (likes += blog.likes));
  return likes;
};

const favoriteBlog = (blogs) => {
  let favorite = blogs[0];
  blogs.forEach((blog) => {
    if (blog.likes > favorite.likes) {
      favorite = blog;
    }
  });
  return favorite;
};

const mostBlogs = (blogs) => {
  let authors = [];

  blogs.forEach((blog) => {
    if (!authors.some((obj) => obj.author === blog.author)) {
      authors.push({ author: blog.author, blogs: 1 });
    } else {
      const index = authors.findIndex((obj) => obj.author === blog.author);
      authors[index].blogs += 1;
    }
  });

  return authors.sort((a, b) => b.blogs - a.blogs)[0];
};

const mostLikes = (blogs) => {
  let authors = [];

  blogs.forEach((blog) => {
    if (!authors.some((obj) => obj.author === blog.author)) {
      authors.push({ author: blog.author, likes: blog.likes });
    } else {
      const index = authors.findIndex((obj) => obj.author === blog.author);
      authors[index].likes += blog.likes;
    }
  });

  return authors.sort((a, b) => b.likes - a.likes)[0];
};

const dummyBlogs = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0,
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0,
  },
  {
    _id: "5a422b3a1b54a676234d17f9",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
    __v: 0,
  },
  {
    _id: "5a422b891b54a676234d17fa",
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
    __v: 0,
  },
  {
    _id: "5a422ba71b54a676234d17fb",
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
    __v: 0,
  },
  {
    _id: "5a422bc61b54a676234d17fc",
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
    __v: 0,
  },
];

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
  dummyBlogs,
};
