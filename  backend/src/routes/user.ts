import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, sign, verify } from 'hono/jwt'
import {signupInput} from '@karthik_440/medium-blog'
import { signinInput } from '@karthik_440/medium-blog'
export const userRouter = new Hono<{
    Bindings:{
        DATABASE_URL: string,
        JWT_SECRET:string,
    }
}>();


userRouter.post('/signup' , async (c)=>{
    const prisma = new PrismaClient({
      datasourceUrl : c.env.DATABASE_URL,
    }).$extends(withAccelerate());
  
    const body = await c.req.json();
	const { success } = signupInput.safeParse(body);
	if (!success) {
		c.status(400);
		return c.json({ error: "invalid input" });
	}

    try {

      const user = await prisma.user.create({
        data:{
          email : body.email,
          password :body.password
        },
      })
      const payload ={
        user:user.id,
        email:user.email
      }
      const token = await sign(payload , c.env.JWT_SECRET);
    
      return c.json({
        token
      })
    } catch (error) {
      console.log(error);
      c.status(505)
      return c.json("internal error");
    }
    
  })

  userRouter.post('/signin' , async (c)=>{
    const prisma = new PrismaClient({
      datasourceUrl:c.env.DATABASE_URL
    }).$extends(withAccelerate())
  
    const body = await c.req.json();
    const { success } = signinInput.safeParse(body);
	  if (!success) {
      c.status(400);
      return c.json({ error: "invalid input" });
	}
    try {
      const user = await prisma.user.findFirst({
        where:{
         email:body.email,
         password:body.password
        }
       })
       if(!user){
         c.status(403)
         return c.json({error:"user not found"})
       }
       const jwt = await sign({id:user.id } , c.env.JWT_SECRET);
       
       return c.json({token:jwt});
    } catch (error) {
      console.log(error);
      c.status(505)
      return c.json("internal error");
    }
  })