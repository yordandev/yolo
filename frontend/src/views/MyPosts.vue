<template>
	<a-layout-content style="margin: 0 16px">
		<a-breadcrumb style="margin: 16px 0">
			<a-breadcrumb-item><a href="../Home.vue">Home</a></a-breadcrumb-item
			><a-breadcrumb-item>Account</a-breadcrumb-item><a-breadcrumb-item>My Posts</a-breadcrumb-item>
		</a-breadcrumb>
		<div style="padding: 0 50px">
			<a-row type="flex" justify="space-around" align="middle">
				<a-space direction="vertical">
					<!-- card starts -->
					<a-card :bordered="false" class="cardSize">
						<a-row type="flex" justify="end" align="middle">
							<!-- left column -->
							<a-col :span="21" style="padding: 0 10px 0 0;">
								<p style="margin: 0;">
									Card contentCard contentCard contentCard contentCard contentCard contentCard
									contentCard contentCard contentCard contentCard contentCard contentCard
									contentCard contentCard content contentCard contentCard contentCard contentCard
									contentCard contentCard contentCard contentCard contentCard contentCard content
								</p>
							</a-col>
							<!-- right column -->
							<a-col :span="3">
								<a-space direction="vertical">
									<a-button><a-icon type="up"/></a-button>
									<a-button><a-icon type="down"/></a-button>
								</a-space>
							</a-col>
						</a-row>
						<a-row type="flex" justify="center" align="middle" id="buttonContainer"
							><a-col>
								<a-space>
									<a-button type="primary"
										><router-link to="/update-post">Update</router-link></a-button
									>
									<a-button>Delete</a-button>
								</a-space>
							</a-col></a-row
						>
					</a-card>
					<!-- card ends -->
				</a-space>
			</a-row>
		</div>
	</a-layout-content>
</template>

<script>
// @ is an alias to /src

export default {}
</script>
<style scoped>
.cardSize {
	width: 40vw;
}
#buttonContainer {
	margin: 2vh 0 0 0;
}
</style>
