<template>
	<a-layout-content style="margin: 0 16px">
		<a-breadcrumb style="margin: 16px 0">
			<a-breadcrumb-item><router-link to="/">Home</router-link></a-breadcrumb-item
			><a-breadcrumb-item>Update Post</a-breadcrumb-item></a-breadcrumb
		>
		<div
			:style="{
				padding: '24px',
				background: '#fff',
				minHeight: '360px',
			}"
		>
			<a-row type="flex" justify="center"
				><a-col><h1>Update Post</h1></a-col></a-row
			>
			<a-row type="flex" justify="center">
				<a-col span="20">
					<a-form-model model="form" :label-col="labelCol" :wrapper-col="wrapperCol">
						<a-form-model-item label="Message"
							><a-input v-model="form.message" type="textarea" :rows="10"
						/></a-form-model-item>
						<a-form-model-item :wrapper-col="{ span: 14, offset: 5 }">
							<a-button type="primary" @click.prevent="handleSubmit">
								Update
							</a-button>
							<a-button style="margin-left: 10px;"
								><router-link to="/my-posts"> Cancel</router-link>
							</a-button>
						</a-form-model-item>
					</a-form-model>
				</a-col>
			</a-row>
		</div>
	</a-layout-content>
</template>

<script>
import { getMyUserDetails, getPost, updatePost } from '../yolo-client'

export default {
	data() {
		return {
			labelCol: { span: 5 },
			wrapperCol: { span: 14 },
			form: {
				message: '',
			},
		}
	},
	methods: {
		handleSubmit() {
			updatePost(this.$route.params.id, this.form.message)
				.then((res) =>
					this.$notification['success']({
						message: res,
					})
				)
				.catch((err) =>
					this.$notification['error']({
						message: err,
					})
				)
		},
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
		await getPost(this.$route.params.id)
			.then((res) => {
				this.form.message = res.data.message
			})
			.catch((err) => {
				console.error(err)
			})
	},
}
</script>
<style scoped></style>
