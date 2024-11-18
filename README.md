# Specdit - A Reddit-like API

A Reddit-style API built with Node.js, Express.js, Prisma & PostgreSQL that provides core Reddit functionalities including subreddits, posts, comments, and voting.

## Resources
- [Specdit Postman Collection](https://www.postman.com/tshiamo-phaahla/specdit-api/overview)

## TODO
- [ ] Rate limiting
- [ ] Automate Deployments on Push (GitHub Workflow)
## Features

- 🔐 Authentication (Register, Login, Password Change)
- 📱 Subreddits (Create, Join, Leave)
- 📝 Posts (Create, Read, Update, Delete)
- 💬 Comments & Replies
- 🔍 Post & Comment Queries
- 🎯 Error Handling
- 🚦 Input Validation
- ⬆️ ⬇️ Voting System (Posts & Comments)

## Prerequisites

- Node.js >= 18.0.0
- PostgreSQL
- npm or yarn

## Environment Setup

1. Clone the repository:

```bash
git clone https://github.com/tphaahla/specdit.git
cd specdit
```

2. Install Dependencies

```bash
npm install
```

3. Setup Environment Variables

```env
DATABASE_URL=
JWT_SECRET=
PORT=
```

4. Set up the database:
   4.1 Generate Prisma client

```
npm run build
```

4.2 Run Migrations

```bash
npm run migrate
```

# Running The Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

## API Endpoints
[Specdit - Postman Collection](https://www.postman.com/tshiamo-phaahla/specdit-api/request/8d4wk7h/register)

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `PATCH /api/auth/change-password` - Change password

### Subreddits

- `POST /api/subreddits` - Create subreddit
- `GET /api/subreddits` - Get all subreddits
- `GET /api/subreddits/:id` - Get specific subreddit
- `PUT /api/subreddits/:id` - Update subreddit
- `DELETE /api/subreddits/:id` - Delete subreddit

### Posts

- `POST /api/posts` - Create post
- `GET /api/posts/:id` - Get post with comments
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `GET /api/posts/me` - Get current user's posts
- `GET /api/posts/user/:username` - Get user's posts
- `GET /api/posts/votes/me` - Get voted posts

### Comments

- `POST /api/posts/:postId/comments` - Create comment
- `GET /api/posts/:postId/comments` - Get post comments
- `DELETE /api/comments/:id` - Delete comment

### Voting

- `POST /api/posts/:postId/vote` - Vote on post
- `POST /api/comments/:commentId/vote` - Vote on comment
- `GET /api/posts/:postId/votes` - Get post votes
- `GET /api/comments/votes/me` - Get voted comments

### Subscriptions

- `POST /api/subscriptions` - Subscribe to subreddit
- `DELETE /api/subscriptions/:subredditId` - Unsubscribe
- `GET /api/subscriptions` - Get user subscriptions

## Authentication

The API uses JWT for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

## Error Handling

The API returns consistent error responses:

```json
{
	"success": false,
	"message": "Error message"
}
```

## License

[MIT](https://choosealicense.com/licenses/mit/)
