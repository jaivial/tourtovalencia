/// <reference types="vitest" />
import { describe, it, expect } from 'vitest';
import { validatePartySize } from './partySizeValidation';

describe('Party Size Validation', () => {
  it('should clamp partySize to minPeople when tour is selected and partySize < minPeople', () => {
    const result = validatePartySize(1, 6, 11, 10);
    expect(result).toBe(6);
  });

  it('should clamp partySize to maxPeople when partySize > maxPeople', () => {
    const result = validatePartySize(15, 1, 8, 10);
    expect(result).toBe(8);
  });

  it('should clamp partySize to availablePlaces when tour has no limits', () => {
    const result = validatePartySize(5, 1, undefined, 3);
    expect(result).toBe(3);
  });

  it('should keep partySize unchanged when within valid range', () => {
    const result = validatePartySize(7, 6, 11, 10);
    expect(result).toBe(7);
  });

  it('should use default minPeople of 1 when not specified', () => {
    const result = validatePartySize(0, undefined, 10, 15);
    expect(result).toBe(1);
  });

  it('should respect both maxPeople and availablePlaces constraints', () => {
    // maxPeople=8, availablePlaces=10, so effective max is 8
    const result = validatePartySize(12, 1, 8, 10);
    expect(result).toBe(8);
  });
});
