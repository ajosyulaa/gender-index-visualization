import json
import pandas as pd

class JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if hasattr(obj,'to_json'):
            return obj.to_json()
        return json.JSONEncoder.default(self, obj)

class DataReader:
    def __init__(self, filepath):
        self.filepath = filepath
        self.years = ['2005', '2010', '2012', '2015']
        self.__init_metadata()
        self.__init_years()
        self.__init_countries()
        self.__simplify()
        self.__household_data()
        self.__power_data()
        self.__all_indicator_columns()
        self.__violence_data()
        self.__awareness_data()

    def __init_metadata(self):
        self.domains = ['WORK', 'MONEY', 'KNOWLEDGE', 'TIME', 'POWER', 'HEALTH']
        self.subdomains = {}
        self.subdomains['WORK'] = ['Participation', 'Segregation and quality of work']
        self.subdomains['MONEY'] = ['Financial resources', 'Economic situation']
        self.subdomains['KNOWLEDGE'] = ['Attainment and participation', 'Segregation']
        self.subdomains['TIME'] = ['Care activities', 'Social activities']
        self.subdomains['POWER'] = ['Political', 'Economic', 'Social']
        self.subdomains['HEALTH'] = ['Status', 'Behaviour', 'Access']

    def __init_years(self):
        year_data = {}
        for year in self.years:
            year_data[year] = pd.read_excel(self.filepath, year, index_col=None, na_values=['NA'])

        self.year_data = year_data

    def __init_countries(self):
        countries = pd.read_excel(self.filepath, 'CountryCodes', index_col=None, header=None, na_values=['NA'])
        self.countries = {}
        for idx, row in countries.iterrows():
            self.countries[row[0]] = row[1]

        #self.countries = list(self.year_data['2005'].Country[0:29].values) #first row is EU-28

    def __simplify(self):
        cols_of_interest = ['Country', 'Gender Equality Index']
        for dom in self.domains:
            cols_of_interest += [dom]
            cols_of_interest += self.subdomains[dom]

        self.index_data = {}
        for year in self.year_data:
            tmp = self.year_data[year][cols_of_interest].dropna()
            tmp = json.loads(tmp.to_json(orient='records'))
            self.index_data[year] = tmp

        self.year_data_to_send = {}
        for year in self.year_data:
            tmp = self.year_data[year]
            tmp = json.loads(tmp.to_json(orient='records'))
            self.year_data_to_send[year] = tmp

    def __household_data(self):
        cols_of_interest = ['Country',
                            'Career Prospects Index (points, 0-100) W', 'Career Prospects Index (points, 0-100) M', \
                            'People doing cooking and/or household, every day (%) W', 'People doing cooking and/or household, every day (%) M', \
                            'Workers doing sporting, cultural or leisure activities outside of their home, at least daily or several times a week (%) W',\
                            'Workers doing sporting, cultural or leisure activities outside of their home, at least daily or several times a week (%) M',\
                            'People caring for and educating their children or grandchildren, elderly or people with disabilities, every day (%) W',\
                            'People caring for and educating their children or grandchildren, elderly or people with disabilities, every day (%) M']
        self.household_data = {}
        for year in self.year_data:
            tmp = self.year_data[year][cols_of_interest].dropna()
            tmp = json.loads(tmp.to_json(orient='records'))
            self.household_data[year] = tmp

    def __power_data(self):
        cols_of_interest = ['Country', 'Share of ministers (%) W', 'Share of ministers (%) M','Share of members of parliament (%) W', 'Share of members of parliament (%) M', \
                            'Share of members of regional assemblies (%) W', 'Share of members of regional assemblies (%) M', \
                            'Share of members of boards in largest quoted companies, supervisory board or board of directors (%) W', \
                            'Share of members of boards in largest quoted companies, supervisory board or board of directors (%) M', 'Share of board members of central bank (%) W', \
                            'Share of board members of central bank (%) M', 'Share of board members of research funding organisations (%) W', \
                            'Share of board members of research funding organisations (%) M', 'Share of board members of publically owned broadcasting organisations (%)  W', \
                            'Share of board members of publically owned broadcasting organisations (%)  M', \
                            'Share of members of highest decision making body of the national Olympic sport organisations (%)  W', \
                            'Share of members of highest decision making body of the national Olympic sport organisations (%)  M']
            
        self.power_data = {}
        for year in self.year_data:
            tmp = self.year_data[year][cols_of_interest].dropna()

            #tmp.rename(columns={'Share of board members of publically owned broadcasting organisations (%)  M':"broadcasting_men",
            #                    'Share of board members of publically owned broadcasting organisations (%)  W':"broadcasting_women"}, inplace=True)

            tmp = json.loads(tmp.to_json(orient='records'))
            self.power_data[year]= tmp



    def __all_indicator_columns(self):
        '''
        This only considers indicators that fall in the 0-100 range.
        '''
        indicator_column_map = {}
        indicator_column_map['FTE employment rate'] = ['FTE employment rate (%) W', 'FTE employment rate (%) M']
        indicator_column_map['Employed in education,health'] = ['Employed people in education, human health and social work activities (%) W', \
                                                                                       'Employed people in education, human health and social work activities (%) M']
        indicator_column_map['Personal time off'] = ['Ability to take one hour or two off during working hours to take care of personal or family matters (%) W', \
                                                                                                                'Ability to take one hour or two off during working hours to take care of personal or family matters (%) M']
        indicator_column_map['Career Prospects Index'] = ['Career Prospects Index (points, 0-100) W', \
                                                                          'Career Prospects Index (points, 0-100) M']
        indicator_column_map['Not at-risk-of-poverty'] = ['Not at-risk-of-poverty (%) W', 'Not at-risk-of-poverty (%) M']
        indicator_column_map['Income distribution'] = ['Income distribution S20/S80 (%) W', 'Income distribution S20/S80 (%) M']
        indicator_column_map['Tertiary education'] = ['Graduates of tertiary education (%) W', 'Graduates of tertiary education (%) M']
        indicator_column_map['Participating in education'] = ['People participating in formal or non-formal education (%) W', \
                                                                                              'People participating in formal or non-formal education (%) M']
        indicator_column_map['Tertiary education in health'] = ['Tertiary students in education, health and welfare, humanities and arts (%) W',
                                                                                                               'Tertiary students in education, health and welfare, humanities and arts (%) M']
        indicator_column_map['Caring for children, elderly'] = ['People caring for and educating their children or grandchildren, elderly or people with disabilities, every day (%) W',\
                                                                                                            'People caring for and educating their children or grandchildren, elderly or people with disabilities, every day (%) M']

        indicator_column_map['Cooking/household work'] = ['People doing cooking and/or household, every day (%) W', \
                                                                           'People doing cooking and/or household, every day (%) M']

        indicator_column_map['Sports/leisure activities'] = ['Workers doing sporting, cultural or leisure activities outside of their home, at least daily or several times a week (%) W',\
                                                                                                  'Workers doing sporting, cultural or leisure activities outside of their home, at least daily or several times a week (%) M']

        indicator_column_map['Ministers'] = ['Share of ministers (%) W', 'Share of ministers (%) M']
        indicator_column_map['Parliament'] = ['Share of members of parliament (%) W', 'Share of members of parliament (%) M']
        indicator_column_map['Regional assemblies'] = ['Share of members of regional assemblies (%) W', 'Share of members of regional assemblies (%) W']
        indicator_column_map['Companies'] = ['Share of members of boards in largest quoted companies, supervisory board or board of directors (%) W', \
                                                              'Share of members of boards in largest quoted companies, supervisory board or board of directors (%) M']
        indicator_column_map['Central bank'] = ['Share of board members of central bank (%) W', 'Share of board members of central bank (%) M']
        indicator_column_map['Research organisations'] = ['Share of board members of research funding organisations (%) W', 'Share of board members of research funding organisations (%) M']
        indicator_column_map['Broadcasting organisations'] = ['Share of board members of publically owned broadcasting organisations (%)  W', \
                                                               'Share of board members of publically owned broadcasting organisations (%)  M']
        indicator_column_map['Olympic sport organisations'] = ['Share of members of highest decision making body of the national Olympic sport organisations (%)  W', \
                                                               'Share of members of highest decision making body of the national Olympic sport organisations (%)  M']

        indicator_column_map['Self-perceived health'] = ['Self-perceived health, good or very good (%) W', 'Self-perceived health, good or very good (%) M'] 
        indicator_column_map['Life expectency'] = ['Life expectancy at birth (years) W','Life expectancy at birth (years) M']
        indicator_column_map['Healthy life years'] = ['Healthy life years at birth (years) W','Healthy life years at birth (years) M']
        indicator_column_map['Not Smoking, Drinking'] = ['People who don\'t smoke and are not involved in harmful drinking (%) W',\
                                                          'People who don\'t smoke and are not involved in harmful drinking (%) M']
        indicator_column_map['Physically active, healthy food'] = ['People doing physical activities and/or consuming fruits and vegetables (%) W', \
                                                                    'People doing physical activities and/or consuming fruits and vegetables (%) M']
        indicator_column_map['Unmet medical health'] = ['Population without unmet needs for medical examination (%) W', 'Population without unmet needs for medical examination (%) M']
        indicator_column_map['Unmet dental health'] = ['Population without unmet needs for dental examination (%) W', 'Population without unmet needs for dental examination (%) M']

        indicators = {}
        indicators['WORK'] = ['FTE employment rate',
                              'Employed in education,health',
                              'Personal time off',
                              'Career Prospects Index']

        indicators['MONEY'] = ['Not at-risk-of-poverty',
                               'Income distribution']

        indicators['KNOWLEDGE'] = ['Tertiary education',
                                   'Participating in education',
                                   'Tertiary education in health']

        indicators['TIME'] = ['Caring for children, elderly',
                              'Cooking/household work',
                              'Sports/leisure activities']

        indicators['POWER'] = ['Ministers', \
                               'Parliament', \
                               'Regional assemblies', \
                               'Companies', \
                               'Central bank', \
                               'Research organisations', \
                               'Broadcasting organisations',\
                               'Olympic sport organisations'
                               ]

        indicators['HEALTH'] = ['Self-perceived health','Life expectency','Healthy life years','Not Smoking, Drinking','Physically active, healthy food', 'Unmet medical health','Unmet dental health']

        self.indicators = indicators
        self.indicator_column_map = indicator_column_map

    def __violence_data(self):
        violence = pd.read_excel(self.filepath, 'Violence', index_col=None, na_values=['NA'])
        self.violence = {}
        for idx, row in violence.iterrows():
            self.violence[row[0]] = row[1]

    def __awareness_data(self):
        awareness = pd.read_excel(self.filepath, 'Awareness', index_col=None, na_values=['NA'])
        self.awareness = json.loads(awareness.to_json(orient='records'))
        

    def construct_data(self):
        self.simple_data = {}
        self.simple_data['year_data'] = self.year_data_to_send
        self.simple_data['index_data'] = self.index_data
        self.simple_data['countries'] = self.countries
        self.simple_data['domains'] = self.subdomains
        self.simple_data['household_data'] = self.household_data
        self.simple_data['power_data'] = self.power_data
        self.simple_data['indicators'] = self.indicators
        self.simple_data['indicator_column_map'] = self.indicator_column_map
        self.simple_data['violence'] = self.violence
        self.simple_data['awareness'] = self.awareness

    def jsonify(self):
        self.construct_data()
        return json.dumps(self.simple_data, cls=JSONEncoder)
