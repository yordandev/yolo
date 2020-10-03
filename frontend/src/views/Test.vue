<template>
	<a-layout-content style="margin: 0 16px">
		<div>
			<h1>Test page</h1>
			<a-button @click.prevent="clearToken">Clear token</a-button>
			<a-button @click.prevent="signUp">Sign Up</a-button>
			<a-button @click.prevent="signIn">Sign In</a-button>
			<a-button @click.prevent="getMyUserDetails">Get my user details</a-button>
			<a-button @click.prevent="getMyPosts">Get my posts</a-button>
			<a-button @click.prevent="updateMyProfile">Update My Profile</a-button>
			<a-button @click.prevent="deleteMyProfile">Delete My Profile</a-button>
			<a-button @click.prevent="getPosts">Get posts</a-button>
			<a-button @click.prevent="createPost">Create post</a-button>
			<a-button @click.prevent="updatePost">Update post</a-button>
			<a-button @click.prevent="deletePost">Delete post</a-button>
			<a-button @click.prevent="upvotePost">Upvote post</a-button>
			<a-button @click.prevent="downvotePost">Downvote post</a-button>
		</div>
	</a-layout-content>
</template>

<script>
import * as client from '../yolo-client'

export default {
	data: () => ({
		username: null,
		email: null,
		password: null,
	}),
	methods: {
		clearToken: () => {
			localStorage.removeItem('access_token')
		},
		signUp: () => {
			client
				.signUp('yordan', 'yorddan@yordan.com', 'yordan123')
				.then((res) => console.log(JSON.stringify(res.data)))
				.catch((err) => console.error(err))
		},
		signIn: () => {
			client
				.signIn('yordan', 'yordan123')
				.then((res) => console.log(JSON.stringify(res.data)))
				.catch((err) => console.error(err))
		},
		getMyUserDetails: () => {
			client
				.getMyUserDetails()
				.then((res) => console.log(JSON.stringify(res.data)))
				.catch((err) => console.error(err))
		},
		getMyPosts: () => {
			client
				.getMyPosts()
				.then((res) => console.log(JSON.stringify(res.data)))
				.catch((err) => console.error(err))
		},
		updateMyProfile: () => {
			client
				.updateMyProfile('Testing')
				.then((res) => console.log(res))
				.catch((err) => console.error(err))
		},
		deleteMyProfile: () => {
			client
				.deleteMyProfile()
				.then((res) => console.log(res))
				.catch((err) => console.error(err))
		},
		getPosts: () => {
			client
				.getPosts()
				.then((res) => console.log(JSON.stringify(res.data)))
				.catch((err) => console.error(err))
		},
		createPost: () => {
			client
				.createPost('test message')
				.then((res) => console.log(JSON.stringify(res.data)))
				.catch((err) => console.error(err))
		},
		updatePost: () => {
			client
				.updatePost(7, 'Updated message')
				.then((res) => console.log(JSON.stringify(res.data)))
				.catch((err) => console.error(err))
		},
		deletePost: () => {
			client
				.deletePost(6)
				.then((res) => console.log(res))
				.catch((err) => console.error(err))
		},
		upvotePost: () => {
			client
				.upvotePost(9)
				.then((res) => console.log(res))
				.catch((err) => console.error(err))
		},
		downvotePost: () => {
			client
				.downvotePost(8)
				.then((res) => console.log(res))
				.catch((err) => console.error(err))
		},
	},
}
</script>

<style></style>
