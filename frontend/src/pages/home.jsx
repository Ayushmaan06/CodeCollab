import React, { useEffect, useState } from 'react';
import axios from 'axios';
import GroupCard from '../components/groupCard';
import { useSelector } from 'react-redux';

const Home = () => {
  const [projects, setProjects] = useState([]);
  const isDarkMode = useSelector((state) => state.theme.darkMode);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get('/projects', {
          withCredentials: true,
        });
        console.log('API response:', res.data);
        setProjects(res.data.data || []);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      }
    };

    fetchProjects();
  }, []);

  // Callback to update UI after deletion
  const handleProjectDelete = (deletedId) => {
    setProjects((prevProjects) =>
      prevProjects.filter((project) => project._id !== deletedId)
    );
  };

  return (
    <div
      className={`min-h-screen p-6 ${
        isDarkMode
          ? 'bg-[#3C4F67FF]' // Matches login dark background
          : 'bg-gradient-to-br from-[#D1F1D5] to-[#A7C7E7]' // Matches login light background
      }`}
    >
      <h1
        className={`text-2xl font-semibold mb-6 text-center ${
          isDarkMode ? 'text-white' : 'text-[#1A3C66]'
        }`}
      >
        Your Projects
      </h1>

      {projects.length === 0 ? (
        <p
          className={`text-center text-lg ${
            isDarkMode ? 'text-gray-300' : 'text-[#1A3C66]'
          }`}
        >
          You haven’t created or joined any projects yet.
        </p>
      ) : (
        projects.map((project) => (
          <GroupCard
            key={project._id}
            projectId={project._id}
            groupName={project.title}
            groupDescription={project.description}
            tags={project.tags || []}
            onDelete={handleProjectDelete}
          />
        ))
      )}
    </div>
  );
};

export default Home;
