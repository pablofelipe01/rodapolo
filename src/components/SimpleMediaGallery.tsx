'use client'

interface SimpleMediaProps {
  mediaFiles: Array<{
    id?: string
    url: string
    type: 'image' | 'video'
    name: string
  }>
}

export function SimpleMediaGallery({ mediaFiles }: SimpleMediaProps) {
  if (!mediaFiles || mediaFiles.length === 0) {
    return null
  }

  return (
    <div style={{ border: '2px solid blue', padding: '10px', margin: '10px' }}>
      <p style={{ fontSize: '12px', color: 'blue', margin: '5px 0' }}>
        SimpleMediaGallery: {mediaFiles.length} files
      </p>

      {/* Test with hardcoded working image */}
      <div style={{ marginBottom: '10px' }}>
        <p style={{ fontSize: '10px', color: 'red' }}>
          TEST: Hardcoded working image
        </p>
        <img
          src='https://picsum.photos/200/150'
          alt='Test'
          style={{
            width: '200px',
            height: '150px',
            border: '3px solid orange',
            backgroundColor: 'yellow',
          }}
          onLoad={() => console.log('✅ Hardcoded image loaded')}
          onError={e => console.error('❌ Hardcoded image failed', e)}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {mediaFiles.map((media, index) => (
          <div
            key={media.id || index}
            style={{
              width: '150px',
              height: '150px',
              border: '2px solid red',
              backgroundColor: 'lightgreen',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            {media.type === 'image' ? (
              <>
                <p style={{ fontSize: '10px', padding: '2px' }}>
                  IMG: {media.name}
                </p>
                <img
                  src={media.url}
                  alt={media.name}
                  style={{
                    width: '140px',
                    height: '120px',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                  onLoad={() =>
                    console.log('✅ SimpleMedia loaded:', media.name)
                  }
                  onError={e =>
                    console.error('❌ SimpleMedia failed:', media.name, e)
                  }
                />
              </>
            ) : (
              <div style={{ padding: '10px' }}>
                <p style={{ fontSize: '12px' }}>VIDEO: {media.name}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
