<template>
	<a-layout-content style="margin: 0 16px">
		<a-breadcrumb style="margin: 16px 0">
			<a-breadcrumb-item><a href="../Home.vue">Home</a></a-breadcrumb-item
			><a-breadcrumb-item>Posts</a-breadcrumb-item>
		</a-breadcrumb>
		<Error v-if="error" :error="error" />
		<div style="padding: 0 50px">
			<a-result
				v-if="!posts.length && postsLoaded"
				status="404"
				title="No posts!"
				sub-title="How about you make the first one?"
			>
				<template #extra>
					<a-button type="primary"
						><router-link to="/create-post">Create post</router-link>
					</a-button>
				</template>
			</a-result>
			<a-row type="flex" justify="space-around" align="middle">
				<a-space direction="vertical" size="large">
					<Post
						v-on:upvotePost="upvotePost(post.id)"
						v-on:downvotePost="downvotePost(post.id)"
						:user="user"
						v-for="post in posts"
						:post="post"
						:key="post.id"
					/>
				</a-space>
			</a-row>
		</div>
	</a-layout-content>
</template>

<script>
import { getPosts, getMyUserDetails } from '../yolo-client'
import Error from '../components/Error'
import Post from '../components/Post'

export default {
	props: ['user'],
	components: {
		Error,
		Post,
	},
	data() {
		return {
			error: null,
			posts: [],
			postsLoaded: false,
		}
	},
	mounted: async function() {
		this.$emit('update:selectedKeys', [this.$router.currentRoute.path])
		await getMyUserDetails()
			.then((res) => {
				this.$emit('update:user', res.data)
			})
			.catch((err) => {
				console.error(err)
				this.$emit('update:user', {})
				this.$router.push('/')
			})
		await getPosts()
			.then((res) => {
				this.posts = res.data
			})
			.catch((err) => (this.error = err))
		this.postsLoaded = true
	},
	methods: {
		upvotePost(id) {
			const post = this.posts.findIndex((post) => post.id === id)
			this.posts[post].points += 1
		},
		downvotePost(id) {
			const post = this.posts.findIndex((post) => post.id === id)
			this.posts[post].points -= 1
		},
	},
}
</script>
<style scoped>
.cardSize {
	width: 40vw;
}
</style>
