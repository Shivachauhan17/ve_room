import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect';
import Navbar from './Navbar'


test('renders component testing text', () => {
  render(<Navbar/>)

  const element = screen.getByText('UnityRoom')
  expect(element).toBeDefined()
})