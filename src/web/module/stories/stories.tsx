import { Close } from '@mui/icons-material';
import { Avatar, Box, Container, IconButton, Typography } from '@mui/material';
import { useState } from 'react';
import Stories from 'react-insta-stories';
import { useStoriesQuery, useWatchedStories } from './stories-query';

export const OurStories = () => {
  const [openMeta, _setOpenMeta] = useState({ open: false, id: '' });
  const setOpenMeta = (meta: { open: boolean; id: string }) => {
    if (meta.open) {
      document.body.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    _setOpenMeta(meta);
  };
  const { data: stories } = useStoriesQuery();
  const { watched, setWatch: setWatched } = useWatchedStories();
  const storyNotWatchedIds =
    stories?.map((s) => s.storyId).filter((s) => !watched.includes(s)) ?? [];
  const storyWatchedIds =
    stories?.map((s) => s.storyId).filter((s) => watched.includes(s)) ?? [];
  const storyOrderIds = [...storyNotWatchedIds, ...storyWatchedIds];

  const getStory = (id: string) => {
    const story = stories!.find((s) => s.storyId === id)!;
    if (story.type === 'image' && story?.imageUrl) {
      return { ...story, url: story.imageUrl, profileUrl: story.imageUrl };
    } else {
      return {
        ...story,
        url: story.imageUrl,
        type: 'video',
        profileUrl: 'https://mingle-munch.web.app/logo.png'
      };
    }
  };

  const onNext = () => {
    setWatched(getStory(openMeta.id).storyId);
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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        mt: 2,
        mr: 2,
      }}
    >
      <Typography variant="h6" sx={{ letterSpacing: 4 }}>
        OUR STORIES
      </Typography>
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 2,
          overflowX: 'auto'
        }}
      >
        {storyOrderIds?.map((id) => {
          return (
            <div
              key={id}
              style={{
                border: `2px solid ${
                  watched.includes(id)
                    ? 'gray'
                    : '#Cfff04'
                }`,
                borderRadius: '50%',
                width: '70px',
                height: '70px',
                flexShrink: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                filter: watched.includes(id)
                  ? 'grayscale(1)'
                  : 'brightness(75%)',
                padding: '34px'
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
                src={getStory(id)?.profileUrl}
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
              <Close color="warning" />
            </IconButton>
            {getStory(openMeta.id) ? (
              <Stories
                stories={[
                  {
                    url: getStory(openMeta.id).url,
                    type: getStory(openMeta.id).type,
                    header: {
                      heading: getStory(openMeta.id).title,
                      subheading: '',
                      profileImage: getStory(openMeta.id).profileUrl
                    }
                  }
                ]}
                onStoryEnd={onNext}
                onNext={onNext}
                width="100vw"
                height="100vh"
                storyStyles={{
                  background: '#fff',
                  height: '100vh',
                  objectFit: 'cover'
                }}
              />
            ) : null}
          </div>
        ) : null}
      </Container>
    </Box>
  );
};
