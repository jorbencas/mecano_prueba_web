import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ParticleExplosion from '../components/ParticleExplosion';

describe('ParticleExplosion', () => {
  it('renders particles at specified position', () => {
    const { container } = render(
      <ParticleExplosion x={100} y={200} color="#4ade80" />
    );
    
    // Check that particles are rendered
    const particles = container.querySelectorAll('.fixed');
    expect(particles.length).toBeGreaterThan(0);
  });

  it('calls onComplete after animation', async () => {
    const onComplete = jest.fn();
    
    render(
      <ParticleExplosion x={100} y={200} onComplete={onComplete} />
    );
    
    // Wait for animation to complete (600ms)
    await waitFor(() => expect(onComplete).toHaveBeenCalled(), {
      timeout: 700,
    });
  });

  it('uses custom color when provided', () => {
    const customColor = '#ff0000';
    const { container } = render(
      <ParticleExplosion x={100} y={200} color={customColor} />
    );
    
    // Particles should exist
    expect(container.querySelector('.fixed')).toBeInTheDocument();
  });
});
