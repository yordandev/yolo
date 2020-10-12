<template>
	<div>
		<h4>Redirecting...</h4>
	</div>
</template>

<script>
import { getGoogleAccount } from '../yolo-client'
export default {
	mounted: async function() {
		localStorage.removeItem('access_token')
		this.code = this.$route.query.code
		let data
		await getGoogleAccount(this.$route.query.code)
			.then((res) => {
				data = res
				localStorage.setItem('access_token', res.token)
			})
			.catch((err) => {
				console.log(err)
			})
		this.$emit('update:user', data)
		this.$router.push('/')
	},
}
</script>

<style></style>
