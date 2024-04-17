import { Hono } from "hono";
import { Prisma, PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { verify } from "hono/jwt";
import {createPostInput} from '@karthik_440/medium-blog'
import { updatePostInput } from '@karthik_440/medium-blog'


export const blogRouter = new Hono<{
    Bindings:{
        DATABASE_URL:string,
        JWT_SECRET:string,
    }
    Variables:{
        userId:string,
    }
}>();

    blogRouter.use(async (c, next) => {
        const jwt = c.req.header('Authorization');
        if (!jwt) {
            c.status(401);
            return c.json({ error: "unauthorized" });
        }
        const token = jwt.split(' ')[1] || "";
        const payload = await verify(token, c.env.JWT_SECRET);
        if (!payload) {
            c.status(401);
            return c.json({ error: "unauthorized" });
        }
        c.set('userId', payload.id);
        await next()
    });
    
blogRouter.post('/' , async (c)=>{
    const body =await  c.req.json();
    const authorId = c.get("userId")
    const prisma = new PrismaClient({
        datasourceUrl:c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const { success } = createPostInput.safeParse(body);
	// if (!success) {
	// 	c.status(400);
	// 	return c.json({ error: "invalid input" });
	// }
    try{
        const blog = await prisma.post.create({
            data:{
                title:body.title,
                content: body.content,
                authorId:authorId,
                published:true,

            }
        })
        return c.json({id :blog.id});
    }
     catch(e) {
        c.status(403)
        console.log(e);
        return c.json({
            message:"unable to post"
        })
    }
  })
  
  blogRouter.put('/' , async (c)=>{
    const authorId = c.get("userId")
    const prisma = new PrismaClient({
        datasourceUrl:c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const body = await c.req.json();

    const { success } = updatePostInput.safeParse(body);
	if (!success) {
		c.status(400);
		return c.json({ error: "invalid input" });
	}

    try {
        const updatedPost = await prisma.post.update({
            
            where:{
                id: body.id,
                authorId : authorId,
            },
            data :{
                title:body.title,
                content: body.contentt,
            }
        })
        return c.json({updatedPost});
    } catch (error) {
        c.status(411);
        return c.json("unable to update")
    }
});



blogRouter.get('/:id', async (c) => {
	const id = c.req.param('id');
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());
	
	const post = await prisma.post.findUnique({
		where: {
			id
		}
	});

	return c.json(post);
})