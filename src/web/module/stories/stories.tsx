import { Close } from '@mui/icons-material';
import { Avatar, Container, IconButton } from '@mui/material';
import { useState } from 'react';
import Stories from 'react-insta-stories';
import { useStoriesQuery, useWatchedStories } from './stories-query';

export const OurStories = () => {
  const [openMeta, setOpenMeta] = useState({ open: false, id: '' });
  const { data: stories } = useStoriesQuery();
  const { watched, setWatch } = useWatchedStories();
  const storyNotWatchedIds =
    stories?.map((s) => s.storyId).filter((s) => !watched.includes(s)) ?? [];
  const storyOrderIds = [...storyNotWatchedIds, ...watched];
  const getStory = (id: string) => {
    return stories?.find((s) => s.storyId === id);
  };

  const onNext = () => {
    setWatch(getStory(openMeta.id!)!.storyId);
    const nextStoryIndex =
      (storyOrderIds.indexOf(openMeta.id) + 1) % storyOrderIds.length;
    if (nextStoryIndex === 0) {
      setOpenMeta({ open: false, id: '' });
      return;
    }
    setOpenMeta({
      id: storyOrderIds[nextStoryIndex],
      open: true
    });
  };
  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 2,
        overflowX: 'auto',
        m: 2,
        mt: 4,
        mb: 4
      }}
    >
      {storyOrderIds?.map((id) => {
        return (
          <div
            key={id}
            style={{
              border: `5px solid ${watched.includes(id) ? 'gray' : '#d1ff04'}`,
              borderRadius: '50%',
              width: '70px',
              height: '70px',
              flexShrink: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              filter: watched.includes(id) ? 'grayscale(1)' : 'brightness(75%)'
            }}
            onClick={() => {
              setOpenMeta({
                open: true,
                id: id
              });
            }}
          >
            <Avatar
              alt={getStory(id)?.title}
              src={getStory(id)?.imageUrl}
              sx={{ width: 64, height: 64 }}
            />
          </div>
        );
      })}
      {openMeta.open ? (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999
          }}
        >
          <IconButton
            onClick={() => {
              setOpenMeta({ open: false, id: '' });
            }}
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              zIndex: 9999,
              padding: 2
            }}
          >
            <Close color="secondary" />
          </IconButton>
          <Stories
            stories={[
              {
                url: getStory(openMeta.id)!.imageUrl,
                type: getStory(openMeta.id)!.type,
                header: {
                  heading: getStory(openMeta.id)!.title,
                  subheading: '',
                  profileImage: getStory(openMeta.id)!.imageUrl
                }
              }
            ]}
            onStoryEnd={onNext}
            onNext={onNext}
            width="100vw"
            height="100vh"
            storyStyles={{
              background: '#fff',
              height: '100vh'
            }}
          />
        </div>
      ) : null}
    </Container>
  );
};
