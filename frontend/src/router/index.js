import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home'
import Posts from '../views/Posts'
import MyProfile from '../views/MyProfile'
import MyPosts from '../views/MyPosts'
import SignUp from '../views/SignUp'
import SignIn from '../views/SignIn'
import CreatePost from '../views/CreatePost'
import UpdatePost from '../views/UpdatePost'
import UpdateUser from '../views/UpdateUser'
import Test from '../views/Test'
import Callback from '../views/Callback.vue'

Vue.use(VueRouter)

const routes = [
	{
		path: '/',
		name: 'Home',
		component: Home,
	},
	{
		path: '/posts',
		name: 'Posts',
		component: Posts,
	},
	{
		path: '/my-profile',
		name: 'MyProfile',
		component: MyProfile,
	},
	{
		path: '/my-posts',
		name: 'MyPosts',
		component: MyPosts,
	},
	{
		path: '/sign-up',
		name: 'SignUp',
		component: SignUp,
	},
	{
		path: '/sign-in',
		name: 'SignIn',
		component: SignIn,
	},
	{
		path: '/create-post',
		name: 'CreatePost',
		component: CreatePost,
	},
	{
		path: '/update-post/:id',
		name: 'UpdatePost',
		component: UpdatePost,
	},
	{
		path: '/update-user',
		name: 'UpdateUser',
		component: UpdateUser,
	},
	{
		path: '/test',
		name: 'Test',
		component: Test,
	},
	{
		path: '/callback',
		name: 'Callback',
		component: Callback,
	},
]

const router = new VueRouter({
	routes,
	mode: 'history',
})

export default router
