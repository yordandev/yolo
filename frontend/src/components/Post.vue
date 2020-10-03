<template>
	<a-card :bordered="false" class="cardSize">
		<a-row type="flex" justify="end" align="middle">
			<!-- left column -->
			<a-col :span="21" style="padding: 0 10px 0 0;">
				<p style="margin: 0;">
					{{ post.message }}
				</p>
			</a-col>
			<!-- right column -->
			<a-col :span="3">
				<a-space direction="vertical">
					<a-button v-if="$router.currentRoute.path === '/posts'" @click.prevent="upvote"
						><a-icon type="up"
					/></a-button>
					<p class="points">{{ post.points }}</p>
					<a-button v-if="$router.currentRoute.path === '/posts'" @click.prevent="downvote"
						><a-icon type="down"
					/></a-button>
				</a-space>
			</a-col>
		</a-row>
		<a-row
			v-if="user.id === post.authorId && $router.currentRoute.path === '/my-posts'"
			type="flex"
			justify="center"
			align="middle"
			id="buttonContainer"
			><a-col>
				<a-space>
					<a-button type="primary"><router-link to="/update-post">Update</router-link></a-button>
					<a-button @click.prevent="deletePost">Delete</a-button>
				</a-space>
			</a-col></a-row
		>
	</a-card>
</template>

<script>
import { upvotePost, downvotePost, deletePost } from '../yolo-client'
export default {
	props: ['post', 'user'],
	methods: {
		upvote() {
			upvotePost(this.post.id)
				.then((res) => {
					this.$notification['success']({
						message: res,
					})
				})
				.catch((err) => {
					this.$notification['error']({
						message: err,
					})
				})
		},
		downvote() {
			downvotePost(this.post.id)
				.then((res) => {
					this.$notification['success']({
						message: res,
					})
				})
				.catch((err) => {
					this.$notification['error']({
						message: err,
					})
				})
		},
		deletePost() {
			deletePost(this.post.id)
				.then((res) => {
					this.$notification['success']({
						message: res,
					})
					this.post = null
				})
				.catch((err) => {
					this.$notification['error']({
						message: err,
					})
				})
		},
	},
}
</script>

<style scoped>
.points {
	text-align: center;
	margin: 0;
}

#buttonContainer {
	margin-top: 2vh;
}
</style>
