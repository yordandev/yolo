<template>
	<a-layout-content style="margin: 0 16px">
		<a-breadcrumb style="margin: 16px 0">
			<a-breadcrumb-item><a href="../Home.vue">Home</a></a-breadcrumb-item
			><a-breadcrumb-item>Account</a-breadcrumb-item><a-breadcrumb-item>My Posts</a-breadcrumb-item>
		</a-breadcrumb>
		<div style="padding: 0 50px">
			<Error v-if="error" :error="error" />
			<a-row type="flex" justify="space-around" align="middle">
				<a-space direction="vertical">
					<Post :user="user" v-for="post in posts" :post="post" :key="post.id" />
				</a-space>
			</a-row>
		</div>
	</a-layout-content>
</template>

<script>
import { getMyPosts } from '../yolo-client'
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
		await getMyPosts()
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
#buttonContainer {
	margin: 2vh 0 0 0;
}
</style>
