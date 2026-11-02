export async function resizeImageTo1080p(file) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.src = URL.createObjectURL(file);

		img.onload = () => {
			const canvas = document.createElement("canvas");
			canvas.width = 1920;
			canvas.height = 1080;

			const ctx = canvas.getContext("2d");

			const sourceWidth = img.width;
			const sourceHeight = img.height;
			const targetRatio = 1920 / 1080;
			const sourceRatio = sourceWidth / sourceHeight;

			let renderWidth, renderHeight, offsetX, offsetY;

			if (sourceRatio > targetRatio) {
				renderHeight = sourceHeight;
				renderWidth = sourceHeight * targetRatio;
				offsetX = (sourceWidth - renderWidth) / 2;
				offsetY = 0;
			} else {
				renderWidth = sourceWidth;
				renderHeight = sourceWidth / targetRatio;
				offsetX = 0;
				offsetY = (sourceHeight - renderHeight) / 2;
			}

			ctx.drawImage(
				img,
				offsetX, offsetY, renderWidth, renderHeight,
				0, 0, 1920, 1080
			);

			canvas.toBlob(
				(blob) => {
					if (blob) {
						const resizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
							type: "image/webp",
						});
						resolve(resizedFile);
					} else {
						reject(new Error("Error procesando la imagen"));
					}
				},
				"image/webp",
				0.85
			);
		};

		img.onerror = (error) => reject(error);
	});
}