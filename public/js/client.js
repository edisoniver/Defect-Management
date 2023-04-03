

async function compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
  
          // Set the desired width and maintain the aspect ratio
          const maxWidth = 800;
          const scaleFactor = maxWidth / img.width;
          canvas.width = maxWidth;
          canvas.height = img.height * scaleFactor;
  
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
          // Convert the canvas to a Blob
          canvas.toBlob((blob) => resolve(blob), file.type, 0.8);
        };
      };
      reader.onerror = (error) => reject(error);
    });
  }
  
  document.getElementById('compressAndUpload').addEventListener('click', async () => {
    const assetId = document.getElementById('assetId').value;
    const overviewPhotoInput = document.getElementById('overviewPhoto');
    const closeupPhotoInput = document.getElementById('closeupPhoto');
    const overviewPhotoFile = overviewPhotoInput.files[0];
    const closeupPhotoFile = closeupPhotoInput.files[0];
  
    if (!overviewPhotoFile || !closeupPhotoFile) {
      alert('Please select both photos before uploading');
      return;
    }
  
    const compressedOverviewPhoto = await compressImage(overviewPhotoFile);
    const compressedCloseupPhoto = await compressImage(closeupPhotoFile);
  
    const formData = new FormData();
    formData.append('overviewPhoto', compressedOverviewPhoto, overviewPhotoFile.name);
    formData.append('closeupPhoto', compressedCloseupPhoto, closeupPhotoFile.name);
  
    // Add other form fields
    const description = document.getElementById('description').value;
    const user = document.getElementById('user').value;
    formData.append('description', description);
    formData.append('user', user);
  

    const response = await fetch(`/upload/${assetId}`, {
      method: 'POST',
      body: formData,
    });
  
    if (response.ok) {
      window.location.href = `/defects/${assetId}`;
    } else {
      alert('Error uploading images');
    }
  });
  