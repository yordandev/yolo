<template>
	<a-layout-content style="margin: 0 16px">
		<a-breadcrumb style="margin: 16px 0">
			<a-breadcrumb-item><router-link to="/">Home</router-link></a-breadcrumb-item
			><a-breadcrumb-item>Account</a-breadcrumb-item><a-breadcrumb-item>My Posts</a-breadcrumb-item>
		</a-breadcrumb>
		<div style="padding: 0 50px">
			<a-result
				v-if="!posts.length && postsLoaded"
				status="404"
				title="No posts!"
				sub-title="You haven't created any posts. How about you make your first one?"
			>
				<template #extra>
					<a-button type="primary"
						><router-link to="/create-post">Create post</router-link>
					</a-button>
				</template>
			</a-result>
			<Error v-if="error" :error="error" />
			<a-row type="flex" justify="space-around" align="middle">
				<a-space direction="vertical">
					<Post
						v-on:deletePost="deletePost(post.id)"
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
import { getMyPosts, getMyUserDetails } from '../yolo-client'
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

		await getMyPosts()
			.then((res) => {
				this.posts = res.data
			})
			.catch((err) => (this.error = err))
		this.postsLoaded = true
	},
	methods: {
		deletePost(id) {
			this.posts = this.posts.filter((post) => post.id !== id)
		},
	},
}
</script>
<style scoped>
.cardSize {
	width: 40vw;
}
#buttonContainer {
	margin: 2vh 0 0 0;
}
</style>
