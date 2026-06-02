import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  activeModal: string | null;
  unreadNotifications: number;
}

const initialState: UiState = {
  sidebarOpen: true,
  sidebarCollapsed: false,
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  activeModal: null,
  unreadNotifications: 0,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    toggleSidebarCollapse: (state) => { state.sidebarCollapsed = !state.sidebarCollapsed; },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => { state.sidebarOpen = action.payload; },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    openModal: (state, action: PayloadAction<string>) => { state.activeModal = action.payload; },
    closeModal: (state) => { state.activeModal = null; },
    setUnreadNotifications: (state, action: PayloadAction<number>) => { state.unreadNotifications = action.payload; },
  },
});

export const { toggleSidebar, toggleSidebarCollapse, setSidebarOpen, setTheme, openModal, closeModal, setUnreadNotifications } = uiSlice.actions;
export default uiSlice.reducer;
