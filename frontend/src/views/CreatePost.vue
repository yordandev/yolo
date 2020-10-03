<template>
	<a-layout-content style="margin: 0 16px">
		<a-breadcrumb style="margin: 16px 0">
			<a-breadcrumb-item><a href="../Home.vue">Home</a></a-breadcrumb-item
			><a-breadcrumb-item>Create Post</a-breadcrumb-item></a-breadcrumb
		>
		<div
			:style="{
				padding: '24px',
				background: '#fff',
				minHeight: '360px',
			}"
		>
			<a-row type="flex" justify="center"
				><a-col><h1>Create Post</h1></a-col></a-row
			>
			<a-row type="flex" justify="center">
				<a-col span="20">
					<Error v-if="error" :error="error" />
					<a-form-model ref="postForm" model="form" :label-col="labelCol" :wrapper-col="wrapperCol">
						<a-form-model-item label="Message" required
							><a-input v-model="form.message" placeholder="Message" type="textarea" :rows="10"
						/></a-form-model-item>
						<a-form-model-item :wrapper-col="{ span: 14, offset: 5 }">
							<a-button type="primary" @click.prevent="handleSubmit">
								Create
							</a-button>
						</a-form-model-item>
					</a-form-model>
				</a-col>
			</a-row>
		</div>
	</a-layout-content>
</template>

<script>
import { createPost } from '../yolo-client'
import Error from '../components/Error'

export default {
	components: {
		Error,
	},
	data() {
		return {
			error: null,
			labelCol: { span: 5 },
			wrapperCol: { span: 14 },
			form: {
				message: '',
			},
		}
	},
	methods: {
		handleSubmit() {
			this.$refs.postForm.validate((valid) => {
				if (valid) {
					createPost(this.form.message)
						.then(() => {
							this.$router.push('/posts')
						})
						.catch((err) => (this.error = err))
				} else {
					console.log('error submit!!')
					return false
				}
			})
		},
	},
}
</script>
<style scoped></style>
