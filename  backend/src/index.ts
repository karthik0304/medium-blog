import { Hono } from 'hono'
import { userRouter } from './routes/user';
import { blogRouter } from './routes/blog';


const app = new Hono<{
  Bindings:{
    DATABASE_URL: string
    JWT_SECRET : string
  }
}>();
app.get('/', (c) => c.text(`this is karthik's backend`))

app.route('api/v1/user', userRouter);
app.route('api/v1/blog', blogRouter);






export default app
