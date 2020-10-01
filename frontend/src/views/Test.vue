<template>
	<a-layout-content style="margin: 0 16px">
		<div>
			<h1>Test page</h1>
			<a-button @click.prevent="clearToken">Clear token</a-button>
			<a-button @click.prevent="signUp">Sign Up</a-button>
			<a-button @click.prevent="signIn">Sign In</a-button>
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
				.signUp('yordan', 'yordan@yordan.com', 'yordan123')
				.then((res) => console.log('RESE' + res.data))
				.catch((err) => console.log(err))
		},
		signIn: () => {
			client
				.signIn('yordan', 'yordan123')
				.then((res) => console.log('RESE2' + res.data))
				.catch((err) => console.log(err))
		},
		getMyPosts: () => {
			client
				.getMyPosts()
				.then((res) => console.log(JSON.stringify(res.data)))
				.catch((err) => console.log(err))
		},
		updateMyProfile: () => {
			client
				.updateMyProfile('Testing')
				.then((res) => console.log(res))
				.catch((err) => console.log(err))
		},
		deleteMyProfile: () => {
			client
				.deleteMyProfile()
				.then((res) => console.log(res))
				.catch((err) => console.log(err))
		},
		getPosts: () => {
			client
				.getPosts()
				.then((res) => console.log(JSON.stringify(res.data)))
				.catch((err) => console.log(err))
		},
		createPost: () => {
			client
				.createPost('test message')
				.then((res) => console.log(JSON.stringify(res.data)))
				.catch((err) => console.log(err))
		},
		updatePost: () => {
			client
				.updatePost(7, 'Updated message')
				.then((res) => console.log(JSON.stringify(res.data)))
				.catch((err) => console.log(err))
		},
		deletePost: () => {
			client
				.deletePost(7)
				.then((res) => console.log(JSON.stringify(res.data)))
				.catch((err) => console.log(err))
		},
		upvotePost: () => {
			client
				.upvotePost(9)
				.then((res) => console.log(JSON.stringify(res.data)))
				.catch((err) => console.log(err))
		},
		downvotePost: () => {
			client
				.downvotePost(7)
				.then((res) => console.log(JSON.stringify(res.data)))
				.catch((err) => console.log(err))
		},
	},
}
</script>

<style></style>
