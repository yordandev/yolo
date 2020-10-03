<template>
	<a-layout-content style="margin: 0 16px">
		<a-breadcrumb style="margin: 16px 0">
			<a-breadcrumb-item><a href="../Home.vue">Home</a></a-breadcrumb-item
			><a-breadcrumb-item>Posts</a-breadcrumb-item>
		</a-breadcrumb>
		<Error v-if="error" :error="error" />
		<div style="padding: 0 50px">
			<a-row type="flex" justify="space-around" align="middle">
				<a-space direction="vertical" size="large">
					<Post :user="user" v-for="post in posts" :post="post" :key="post.id" />
				</a-space>
			</a-row>
		</div>
	</a-layout-content>
</template>

<script>
import { getPosts } from '../yolo-client'
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
		}
	},
	created: async function() {
		await getPosts()
			.then((res) => {
				this.posts = res.data
			})
			.catch((err) => (this.error = err))
	},
}
</script>
<style scoped>
.cardSize {
	width: 40vw;
}
</style>
