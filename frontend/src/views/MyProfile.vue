<template>
	<a-layout-content style="margin: 0 16px">
		<a-breadcrumb style="margin: 16px 0">
			<a-breadcrumb-item><router-link to="/">Home</router-link></a-breadcrumb-item
			><a-breadcrumb-item>Account</a-breadcrumb-item
			><a-breadcrumb-item>My Profile</a-breadcrumb-item></a-breadcrumb
		>
		<div
			:style="{
				padding: '24px',
				background: '#fff',
				minHeight: '360px',
			}"
		>
			<a-row type="flex" align="middle">
				<a-col>
					<h1>Hi {{ user.username }}!</h1>
					<h3>The information here is only visible to you.</h3>
					<p>
						Email: <strong>{{ user.email }}</strong>
					</p>
					<p>
						Life points: <strong>{{ user.life_points }}</strong>
					</p>
					<a-space>
						<a-button type="primary"
							><router-link to="/update-user">Update your Information</router-link></a-button
						>
						<a-button @click.prevent="deleteAccount">Delete your Account</a-button>
					</a-space>
				</a-col>
			</a-row>
		</div>
	</a-layout-content>
</template>

<script>
import { getMyUserDetails, deleteMyProfile } from '../yolo-client'

export default {
	props: ['user'],
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
	},
	methods: {
		deleteAccount() {
			deleteMyProfile()
				.then(() => {
					this.$notification['success']({
						message: 'Successfully deleted!',
					})
					this.$emit('update:user', {})
					this.$router.push('/')
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
<style scoped></style>
