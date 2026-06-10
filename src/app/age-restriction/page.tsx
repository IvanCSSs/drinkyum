export const metadata = {
	title: "Age Restricted",
	robots: { index: false, follow: false },
};

export default function AgeRestrictionPage() {
	return (
		<main className="min-h-screen bg-yum-dark text-white flex items-center justify-center px-6 py-12">
			<div className="max-w-md text-center">
				<h1 className="text-3xl font-semibold mb-3">Adults Only</h1>
				<p className="text-white/70">
					You must be 21 or older to access this site. Thanks for your
					understanding.
				</p>
			</div>
		</main>
	);
}
