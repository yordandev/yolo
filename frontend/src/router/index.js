import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Posts from "../views/Posts.vue";
import MyProfile from "../views/MyProfile";
import MyPosts from "../views/MyPosts";
import CreateAccount from "../views/CreateAccount";

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
];

const router = new VueRouter({
  routes,
});

export default router;
