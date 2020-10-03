<template>
	<a-layout id="components-layout-demo-side" style="min-height: 100vh">
		<a-layout-sider v-model="collapsed" collapsible>
			<div class="logo" />
			<a-menu theme="dark" :defaultSelectedKeys="[$router.currentRoute]" mode="inline">
				<a-menu-item key="/">
					<router-link to="/">
						<a-icon type="home" />
						<span>Home</span></router-link
					>
				</a-menu-item>
				<a-menu-item v-if="user.id" key="posts">
					<router-link to="/posts">
						<a-icon type="robot" />
						<span>Posts</span></router-link
					>
				</a-menu-item>
				<a-menu-item v-if="user.id" key="create-post">
					<router-link to="/create-post">
						<a-icon type="plus-circle" />
						<span>Create Post</span></router-link
					>
				</a-menu-item>
				<a-sub-menu v-if="user.id" key="sub1">
					<span slot="title"><a-icon type="user" /><span>Account</span></span>
					<a-menu-item key="4">
						<router-link to="/my-profile"> My Profile</router-link>
					</a-menu-item>
					<a-menu-item key="5">
						<router-link to="/my-posts"> My Posts</router-link>
					</a-menu-item>
				</a-sub-menu>
				<a-menu-item v-if="!user.id" key="7">
					<router-link to="/sign-in">
						<a-icon type="login" />
						<span>Sign In</span></router-link
					>
				</a-menu-item>
				<a-menu-item v-if="!user.id" key="6">
					<router-link to="/sign-up">
						<a-icon type="user-add" />
						<span>Sign Up</span></router-link
					>
				</a-menu-item>
			</a-menu>
		</a-layout-sider>
		<a-layout>
			<a-layout-header align="end">
				<a-space size="large">
					<a-button type="primary" v-if="user.id" @click.prevent="signOut">
						Sign Out
					</a-button>
					<a-button type="primary" v-if="!user.id"
						><router-link to="/sign-in"> Sign In</router-link>
					</a-button>
					<a-button type="primary" v-if="!user.id"
						><router-link to="/sign-up"> Sign up</router-link>
					</a-button>
				</a-space>
			</a-layout-header>
			<router-view :user.sync="user"></router-view>
		</a-layout>
	</a-layout>
</template>
<script>
import { getMyUserDetails, signOut } from './yolo-client'

export default {
	data() {
		return {
			user: {},
			collapsed: false,
		}
	},
	created: async function() {
		await getMyUserDetails()
			.then((res) => {
				console.log(res.data)
				this.user = res.data
			})
			.catch((err) => {
				console.error(err)
			})
	},
	methods: {
		signOut() {
			signOut()
			this.user = {}
			this.$router.push('/')
		},
	},
}
</script>

<style>
#components-layout-demo-side .logo {
	height: 32px;
	background: rgba(255, 255, 255, 0.2);
	margin: 16px;
}
h1 {
	font-size: 36px;
}
h2 {
	font-size: 28px;
}
h3 {
	font-size: 20px;
}
p {
	font-size: 14px;
}
</style>
