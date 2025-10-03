const mongoose = require('mongoose');
const dotenv = require('dotenv');
const GameResult = require('./models/GameResult');

// Load environment variables
dotenv.config();

async function testDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.name);

    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📂 Available collections:');
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });

    // Check GameResult collection specifically
    const gameResultsCount = await GameResult.countDocuments();
    console.log(`\n🎮 GameResult documents count: ${gameResultsCount}`);

    // Try to find any existing game results
    const existingResults = await GameResult.find().limit(5).sort({ createdAt: -1 });
    console.log('\n📋 Recent game results:');
    if (existingResults.length === 0) {
      console.log('  No game results found');
    } else {
      existingResults.forEach((result, index) => {
        console.log(`  ${index + 1}. Room: ${result.roomCode}, Player: ${result.playerName}, Score: ${result.score}`);
      });
    }

    // Test creating a sample record
    console.log('\n🧪 Testing record creation...');
    const testResult = new GameResult({
      roomCode: 'TEST123',
      player: new mongoose.Types.ObjectId(),
      playerName: 'Test Player',
      category: 'Technology',
      score: 85,
      questionsAttempted: 10,
      correctAnswers: 8,
      accuracy: 80,
      gameStartedAt: new Date(),
      timeTaken: 300
    });

    const saved = await testResult.save();
    console.log('✅ Test record saved with ID:', saved._id);

    // Clean up test record
    await GameResult.findByIdAndDelete(saved._id);
    console.log('🧹 Test record cleaned up');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

testDatabase();