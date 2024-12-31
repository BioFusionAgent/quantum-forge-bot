// Add this code after the ready event handler initialization
client.once('ready', async () => {
  console.log(`Quantum-Forge initialized as ${client.user.tag}`);

  // Update bot username if needed
  if (client.user.username !== 'Quantum-Forge') {
    try {
      await client.user.setUsername('Quantum-Forge');
      console.log('System: Bot designation updated to Quantum-Forge');
    } catch (error) {
      console.error('Username update error:', error);
      console.log('Note: Username can only be changed twice per hour due to Discord rate limits');
    }
  }

  // Set bot avatar
  try {
    const avatarUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image%20(22).jpg-mQZSisIcGmE1piRS2ZvstSJn8eU5n4.jpeg';
    
    if (client.user.avatarURL() !== avatarUrl) {
      await client.user.setAvatar(avatarUrl);
      console.log('System: Avatar configuration complete');
    }
  } catch (error) {
    console.error('Avatar update error:', error);
  }
});

