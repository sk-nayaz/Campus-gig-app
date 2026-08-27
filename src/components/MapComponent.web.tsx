import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const PROVIDER_DEFAULT = null;

export const Marker = ({ children, title, description, coordinate }: any) => {
    return <View>{children}</View>;
};

export const MapView = ({ children, style }: any) => {
    return (
        <View style={[styles.container, style]}>
            <Text style={styles.text}>Map is not supported on web in this version.</Text>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: '#6B7280',
        fontSize: 16,
    }
});

export default MapView;
