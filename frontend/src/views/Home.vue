<template>
	<a-layout-content style="margin: 0 16px">
		<a-breadcrumb style="margin: 16px 0"> </a-breadcrumb>
		<div
			:style="{
				padding: '24px',
				background: '#fff',
				minHeight: '360px',
			}"
		>
			<a-row type="flex" justify="space-around" align="middle">
				<a-col>
					<h1>Welcome to YOLO!</h1>
				</a-col>
			</a-row>
			<a-row type="flex" justify="space-around" align="middle">
				<a-col>
					<p>
						YOLO is a message board for anyone to use.<br />
						Every posts can be either upvoted (⬆️) or downvoted (⬇️) by the community, which leads
						to an increase or decrease in your life-points🔋.<br />
						If your life-points hits 0, your account will automatically be deleted💣.
					</p>
				</a-col>
			</a-row>
		</div>
	</a-layout-content>
</template>

<script>
export default {
	mounted: function() {
		this.$emit('update:selectedKeys', [this.$router.currentRoute.path])
	},
}
</script>
<style scoped></style>
