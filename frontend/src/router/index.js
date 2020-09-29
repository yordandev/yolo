import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Posts from "../views/Posts.vue";
import MyProfile from "../views/MyProfile";
import MyPosts from "../views/MyPosts";
import CreateAccount from "../views/CreateAccount";
import SignIn from "../views/SignIn";
import CreatePost from "../views/CreatePost";
import UpdatePost from "../views/UpdatePost";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/posts",
    name: "Posts",
    component: Posts,
  },
  {
    path: "/my-profile",
    name: "MyProfile",
    component: MyProfile,
  },
  {
    path: "/my-posts",
    name: "MyPosts",
    component: MyPosts,
  },
  {
    path: "/create-account",
    name: "CreateAccount",
    component: CreateAccount,
  },
  {
    path: "/sign-in",
    name: "SignIn",
    component: SignIn,
  },
  {
    path: "/create-post",
    name: "CreatePost",
    component: CreatePost,
  },
  {
    path: "/update-post",
    name: "UpdatePost",
    component: UpdatePost,
  },
];

const router = new VueRouter({
  routes,
});

export default router;
