'use client'

export function ImageTest() {
  const testUrl =
    'https://rfwbenguhgtaztppnppy.supabase.co/storage/v1/object/public/media/posts/1758730479295-bgpmei3oph5.png'

  return (
    <div className='p-4 border-2 border-red-500 bg-white'>
      <h3 className='text-lg font-bold mb-2'>Image Test Component</h3>

      {/* Test 1: Basic img tag */}
      <div className='mb-4'>
        <p className='text-sm text-gray-600 mb-2'>
          Test 1: Basic img tag (200x200)
        </p>
        <img
          src={testUrl}
          alt='Test image'
          width='200'
          height='200'
          style={{
            border: '2px solid blue',
            backgroundColor: 'pink',
          }}
          onLoad={() => console.log('✅ Basic img loaded')}
          onError={e => console.error('❌ Basic img failed:', e)}
        />
      </div>

      {/* Test 2: With object-cover */}
      <div className='mb-4'>
        <p className='text-sm text-gray-600 mb-2'>
          Test 2: With object-cover (200x200)
        </p>
        <img
          src={testUrl}
          alt='Test image with object-cover'
          className='object-cover'
          style={{
            width: '200px',
            height: '200px',
            border: '2px solid green',
            backgroundColor: 'yellow',
          }}
          onLoad={() => console.log('✅ Object-cover img loaded')}
          onError={e => console.error('❌ Object-cover img failed:', e)}
        />
      </div>

      {/* Test 3: Different URL format */}
      <div className='mb-4'>
        <p className='text-sm text-gray-600 mb-2'>Test 3: Placeholder image</p>
        <img
          src='https://picsum.photos/200'
          alt='Placeholder'
          width='200'
          height='200'
          style={{
            border: '2px solid purple',
            backgroundColor: 'lightblue',
          }}
          onLoad={() => console.log('✅ Placeholder loaded')}
          onError={e => console.error('❌ Placeholder failed:', e)}
        />
      </div>
    </div>
  )
}
