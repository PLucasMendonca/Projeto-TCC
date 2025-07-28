import { StyleSheet } from 'react-native';
import { cores } from './cores';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  comparisonContainer: {
    padding: 16,
  },
  header: {
    padding: 16,
    backgroundColor: cores.primaria,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: cores.branco,
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: cores.secundaria,
  },
  selectedTab: {
    backgroundColor: cores.destaque,
  },
  tabText: {
    color: cores.branco,
    fontSize: 16,
  },
  selectedTabText: {
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  comparisonItem: {
    backgroundColor: cores.branco,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  comparisonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  comparisonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: cores.preto,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  successStatus: {
    backgroundColor: cores.complementar,
  },
  errorStatus: {
    backgroundColor: cores.terciaria,
  },
  comparisonValue: {
    fontSize: 16,
    color: cores.preto,
    marginBottom: 4,
  },
  comparisonDescription: {
    fontSize: 14,
    color: cores.secundaria,
  },
  additionalInfoContainer: {
    backgroundColor: cores.branco,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  additionalInfoItem: {
    marginBottom: 16,
  },
  additionalInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: cores.preto,
    marginBottom: 4,
  },
  additionalInfoValue: {
    fontSize: 14,
    color: cores.secundaria,
  },
});

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.background,
  },
  comparisonContainer: {
    padding: 16,
  },
  header: {
    padding: 16,
    backgroundColor: cores.primary,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: cores.white,
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: cores.secondary,
  },
  selectedTab: {
    backgroundColor: cores.accent,
  },
  tabText: {
    color: cores.white,
    fontSize: 16,
  },
  selectedTabText: {
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  comparisonItem: {
    backgroundColor: cores.white,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  comparisonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  comparisonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: cores.text,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  successStatus: {
    backgroundColor: cores.success,
  },
  errorStatus: {
    backgroundColor: cores.error,
  },
  comparisonValue: {
    fontSize: 16,
    color: cores.text,
    marginBottom: 4,
  },
  comparisonDescription: {
    fontSize: 14,
    color: cores.textSecondary,
  },
  additionalInfoContainer: {
    backgroundColor: cores.white,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  additionalInfoItem: {
    marginBottom: 16,
  },
  additionalInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: cores.text,
    marginBottom: 4,
  },
  additionalInfoValue: {
    fontSize: 14,
    color: cores.textSecondary,
  },
});

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  comparisonContainer: {
    padding: 16,
  },
  header: {
    padding: 16,
    backgroundColor: cores.primaria,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: cores.primaria,
    marginBottom: 10,
  },
  compatibilityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  compatibilityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: cores.branco,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: cores.primary,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: cores.branco,
  },
  tabButtonText: {
    fontSize: 16,
    color: cores.primaria,
    opacity: 0.7,
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  screenshotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
  },
  screenshot: {
    width: '48%',
    aspectRatio: 16/9,
    marginBottom: 10,
    borderRadius: 8,
  },
  comparisonItem: {
    backgroundColor: cores.secundaria,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  itemTitleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: cores.primaria,
    marginBottom: 8,
  },
  checkIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  checkText: {
    fontSize: 14,
    color: cores.primaria,
    flex: 1,
  },
  itemStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemStatusText: {
    fontSize: 14,
    color: cores.primaria,
    marginLeft: 8,
  },
  specValue: {
    fontSize: 14,
    color: cores.terciaria,
  },
  specDescription: {
    fontSize: 12,
    color: cores.terciaria,
    marginTop: 4,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  infoTitle: {
    fontSize: 14,
    color: cores.primaria,
    fontWeight: 'bold',
  },
  infoValue: {
    fontSize: 14,
    color: cores.terciaria,
  },
  additionalInfoItem: {
    marginBottom: 16,
  },
});
